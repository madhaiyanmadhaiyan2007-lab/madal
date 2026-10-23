"""
MockMate AI - Candidate Answers Router
Handles audio answer uploads, saves files to disk, executes Whisper transcription,
computes speech fluency metrics (WPM, filler words, pauses), calls LLM for answer evaluation,
and persists MediaPipe browser body language analytics (eye contact, head tilt, smile, face visibility) to PostgreSQL.
"""

import os
import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
from auth import get_current_user
from services.whisper_service import transcribe_and_analyze_speech
from services.llm_service import evaluate_candidate_answer

router = APIRouter(prefix="/answers", tags=["Answers"])

# Define upload directory path
UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads" / "audio"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post(
    "/upload",
    response_model=schemas.AnswerUploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload audio recording, transcribe with Whisper, evaluate with LLM, and save body language metrics"
)
async def upload_answer(
    interview_id: int = Form(..., description="ID of the active interview session"),
    question_id: int = Form(..., description="ID of the question being answered"),
    file: UploadFile = File(..., description="Recorded audio file (e.g. webm/wav/mp3)"),
    # Phase 7: Body Language Numeric Scores (Computed client-side with MediaPipe in browser - NO VIDEO TRANSMITTED)
    eye_contact_pct: float = Form(0.0, description="Eye contact percentage calculated in browser"),
    head_tilt_pct: float = Form(0.0, description="Head posture stability percentage"),
    smile_pct: float = Form(0.0, description="Smile expression percentage"),
    face_visible_pct: float = Form(0.0, description="Face visibility percentage during answer"),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Complete Pipeline (Speech + Evaluation + Body Language):
    1. Validates candidate session and question integrity.
    2. Persists audio file locally in uploads/audio/.
    3. Transcribes speech using faster-whisper (English + Tamil) and computes fluency metrics.
    4. Evaluates transcript using LLM (Relevance, Structure, Depth, Communication, Strengths, Weaknesses, Model Answer).
    5. Saves all metrics, evaluation scores, and MediaPipe body language scores to PostgreSQL Answer table.
    6. Returns combined transcript, speech metrics, LLM evaluation, and body language scores to the client.
    """
    # 1. Verify Interview ownership
    interview = db.query(models.Interview).filter(
        models.Interview.id == interview_id,
        models.Interview.user_id == current_user.id
    ).first()

    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found or does not belong to your account."
        )

    # 2. Verify Question belongs to Interview
    question = db.query(models.Question).filter(
        models.Question.id == question_id,
        models.Question.interview_id == interview_id
    ).first()

    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question does not belong to the specified interview."
        )

    # 3. Determine file extension and generate unique filename
    original_ext = Path(file.filename or "").suffix.lower()
    if not original_ext or original_ext not in [".webm", ".wav", ".mp3", ".ogg", ".m4a"]:
        original_ext = ".webm"

    timestamp_str = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    unique_id = uuid.uuid4().hex[:8]
    filename = f"int{interview_id}_q{question_id}_{timestamp_str}_{unique_id}{original_ext}"
    file_path = UPLOAD_DIR / filename

    # 4. Save file contents to disk
    try:
        contents = await file.read()
        if len(contents) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded audio file is empty."
            )

        with open(file_path, "wb") as f:
            f.write(contents)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save audio file to disk: {str(exc)}"
        )

    stored_path = f"uploads/audio/{filename}"

    # 5. Execute Whisper Transcription & Speech Metrics Analysis (Phase 5)
    speech_result = transcribe_and_analyze_speech(
        audio_file_path=str(file_path),
        language=interview.language
    )

    transcript = speech_result.get("transcript", "")
    metrics_data = speech_result.get("metrics", {})

    duration_sec = float(metrics_data.get("duration_seconds", 0.0))
    wpm = float(metrics_data.get("words_per_minute", 0.0))
    filler_count = int(metrics_data.get("filler_words_count", 0))
    fillers_list_json = json.dumps(metrics_data.get("filler_words_detected", []))
    pauses_count = int(metrics_data.get("long_pauses_count", 0))

    # 6. Execute LLM Answer Evaluation (Phase 6)
    evaluation_result = evaluate_candidate_answer(
        question_text=question.question_text,
        role=interview.role,
        language=interview.language,
        transcript=transcript,
    )

    scores_dict = evaluation_result.get("scores", {})
    score_rel = float(scores_dict.get("relevance", 7.0))
    score_struct = float(scores_dict.get("structure", 7.0))
    score_depth = float(scores_dict.get("depth", 7.0))
    score_comm = float(scores_dict.get("communication", 7.0))
    score_ovr = float(scores_dict.get("overall", 7.0))

    strengths_list = evaluation_result.get("strengths", [])
    weaknesses_list = evaluation_result.get("weaknesses", [])
    improved_sample = evaluation_result.get("improved_sample_answer", "")

    # 7. Body Language Assessment Label
    if eye_contact_pct >= 70 and face_visible_pct >= 80:
        bl_assessment = "Strong Eye Contact & Engagement"
    elif eye_contact_pct >= 45:
        bl_assessment = "Moderate Eye Contact"
    else:
        bl_assessment = "Low Eye Contact (Practice looking into the camera lens)"

    # 8. Upsert Answer record in PostgreSQL database
    existing_answer = db.query(models.Answer).filter(
        models.Answer.interview_id == interview_id,
        models.Answer.question_id == question_id
    ).first()

    if existing_answer:
        existing_answer.audio_file_path = stored_path
        existing_answer.transcript = transcript
        existing_answer.duration_seconds = duration_sec
        existing_answer.words_per_minute = wpm
        existing_answer.filler_words_count = filler_count
        existing_answer.filler_words_list = fillers_list_json
        existing_answer.long_pauses_count = pauses_count
        # Evaluation fields
        existing_answer.score_relevance = score_rel
        existing_answer.score_structure = score_struct
        existing_answer.score_depth = score_depth
        existing_answer.score_communication = score_comm
        existing_answer.score_overall = score_ovr
        existing_answer.strengths = json.dumps(strengths_list)
        existing_answer.weaknesses = json.dumps(weaknesses_list)
        existing_answer.improved_answer = improved_sample
        # Body Language fields (Phase 7)
        existing_answer.eye_contact_pct = round(eye_contact_pct, 1)
        existing_answer.head_tilt_pct = round(head_tilt_pct, 1)
        existing_answer.smile_pct = round(smile_pct, 1)
        existing_answer.face_visible_pct = round(face_visible_pct, 1)
        existing_answer.created_at = datetime.now(timezone.utc)
        target_answer = existing_answer
    else:
        new_answer = models.Answer(
            interview_id=interview_id,
            question_id=question_id,
            audio_file_path=stored_path,
            transcript=transcript,
            duration_seconds=duration_sec,
            words_per_minute=wpm,
            filler_words_count=filler_count,
            filler_words_list=fillers_list_json,
            long_pauses_count=pauses_count,
            score_relevance=score_rel,
            score_structure=score_struct,
            score_depth=score_depth,
            score_communication=score_comm,
            score_overall=score_ovr,
            strengths=json.dumps(strengths_list),
            weaknesses=json.dumps(weaknesses_list),
            improved_answer=improved_sample,
            eye_contact_pct=round(eye_contact_pct, 1),
            head_tilt_pct=round(head_tilt_pct, 1),
            smile_pct=round(smile_pct, 1),
            face_visible_pct=round(face_visible_pct, 1),
        )
        db.add(new_answer)
        target_answer = new_answer

    db.commit()
    db.refresh(target_answer)

    return {
        "id": target_answer.id,
        "interview_id": target_answer.interview_id,
        "question_id": target_answer.question_id,
        "audio_file_path": target_answer.audio_file_path,
        "transcript": target_answer.transcript,
        "metrics": metrics_data,
        "evaluation": {
            "scores": {
                "relevance": score_rel,
                "structure": score_struct,
                "depth": score_depth,
                "communication": score_comm,
                "overall": score_ovr,
            },
            "strengths": strengths_list,
            "weaknesses": weaknesses_list,
            "improved_sample_answer": improved_sample,
        },
        "body_language": {
            "eye_contact_pct": target_answer.eye_contact_pct,
            "head_tilt_pct": target_answer.head_tilt_pct,
            "smile_pct": target_answer.smile_pct,
            "face_visible_pct": target_answer.face_visible_pct,
            "assessment": bl_assessment,
        },
        "message": "Audio answer transcribed, evaluated, and saved successfully with body language metrics.",
        "created_at": target_answer.created_at,
    }
