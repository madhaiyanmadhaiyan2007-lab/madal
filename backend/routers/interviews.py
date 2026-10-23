"""
MockMate AI - Interview Endpoints
Handles interview initialization, LLM question generation, past history retrieval,
and Phase 8 comprehensive performance reports with 30% Speech + 40% Answer Quality + 30% Body Language weighting.
"""

import json
from collections import Counter
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
from auth import get_current_user
from services.llm_service import generate_interview_questions

router = APIRouter(prefix="/interviews", tags=["Interviews"])


def compute_question_speech_score(wpm: float, fillers_count: int, pauses_count: int) -> float:
    """Calculates speech fluency score (0 to 10) for an answer."""
    # Pace score (0-10)
    if 120 <= wpm <= 160:
        pace_score = 10.0
    elif (100 <= wpm < 120) or (160 < wpm <= 180):
        pace_score = 8.5
    elif (80 <= wpm < 100) or (180 < wpm <= 200):
        pace_score = 7.0
    elif wpm > 0:
        pace_score = 5.5
    else:
        pace_score = 5.0

    # Filler words score (0-10)
    if fillers_count == 0:
        filler_score = 10.0
    elif fillers_count <= 2:
        filler_score = 8.5
    elif fillers_count <= 4:
        filler_score = 7.0
    elif fillers_count <= 6:
        filler_score = 5.5
    else:
        filler_score = 4.0

    # Long pauses score (0-10)
    if pauses_count == 0:
        pause_score = 10.0
    elif pauses_count == 1:
        pause_score = 8.5
    elif pauses_count <= 2:
        pause_score = 7.0
    else:
        pause_score = 5.0

    return (pace_score * 0.40) + (filler_score * 0.35) + (pause_score * 0.25)


def compute_question_body_language_score(eye_pct: float, head_pct: float, smile_pct: float, face_pct: float) -> float:
    """Calculates body language score (0 to 10) from MediaPipe browser metrics."""
    eye_s = min(max(eye_pct / 10.0, 0.0), 10.0)
    head_s = min(max(head_pct / 10.0, 0.0), 10.0)
    face_s = min(max(face_pct / 10.0, 0.0), 10.0)
    smile_s = min(max(smile_pct / 10.0, 0.0), 10.0)

    # Weighted: Eye Contact (40%), Face Visibility (25%), Head Posture (20%), Expression (15%)
    return (eye_s * 0.40) + (face_s * 0.25) + (head_s * 0.20) + (smile_s * 0.15)


def generate_interview_report_payload(interview: models.Interview) -> schemas.InterviewReportResponse:
    """
    Computes complete interview report:
    - Overall Score = 30% Speech + 40% Answer Quality + 30% Body Language
    - Aggregated strengths, weaknesses, and improvement tips
    - Filler word breakdown chart dataset
    - Question-by-question feedback breakdown
    """
    questions = sorted(interview.questions, key=lambda q: q.question_number)
    total_q = len(questions)
    
    # Map answers by question_id
    answers_map = {ans.question_id: ans for ans in interview.answers}
    answered_count = len(answers_map)

    questions_feedback = []
    speech_scores_list = []
    quality_scores_list = []
    bl_scores_list = []

    all_strengths = []
    all_weaknesses = []
    all_fillers = []

    total_wpm = 0.0
    total_fillers_count = 0
    total_long_pauses = 0

    total_eye_pct = 0.0
    total_head_pct = 0.0
    total_smile_pct = 0.0
    total_face_pct = 0.0

    for q in questions:
        ans = answers_map.get(q.id)
        if ans:
            # Parse strengths & weaknesses JSON
            try:
                st_list = json.loads(ans.strengths) if ans.strengths else []
            except Exception:
                st_list = []
            try:
                wk_list = json.loads(ans.weaknesses) if ans.weaknesses else []
            except Exception:
                wk_list = []
            try:
                f_list = json.loads(ans.filler_words_list) if ans.filler_words_list else []
            except Exception:
                f_list = []

            all_strengths.extend(st_list)
            all_weaknesses.extend(wk_list)
            all_fillers.extend(f_list)

            ans_wpm = ans.words_per_minute or 0.0
            ans_fillers = ans.filler_words_count or 0
            ans_pauses = ans.long_pauses_count or 0

            total_wpm += ans_wpm
            total_fillers_count += ans_fillers
            total_long_pauses += ans_pauses

            eye_pct = ans.eye_contact_pct if ans.eye_contact_pct is not None else 0.0
            head_pct = ans.head_tilt_pct if ans.head_tilt_pct is not None else 0.0
            smile_pct = ans.smile_pct if ans.smile_pct is not None else 0.0
            face_pct = ans.face_visible_pct if ans.face_visible_pct is not None else 0.0

            total_eye_pct += eye_pct
            total_head_pct += head_pct
            total_smile_pct += smile_pct
            total_face_pct += face_pct

            # Compute 3 core dimension scores for this answer
            q_quality = ans.score_overall or 7.0
            q_speech = compute_question_speech_score(ans_wpm, ans_fillers, ans_pauses)
            q_bl = compute_question_body_language_score(eye_pct, head_pct, smile_pct, face_pct)

            quality_scores_list.append(q_quality)
            speech_scores_list.append(q_speech)
            bl_scores_list.append(q_bl)

            eval_scores = schemas.EvaluationScores(
                relevance=ans.score_relevance or 7.0,
                structure=ans.score_structure or 7.0,
                depth=ans.score_depth or 7.0,
                communication=ans.score_communication or 7.0,
                overall=q_quality,
            )

            bl_metrics = schemas.BodyLanguageMetrics(
                eye_contact_pct=eye_pct,
                head_tilt_pct=head_pct,
                smile_pct=smile_pct,
                face_visible_pct=face_pct,
                assessment="Strong Engagement" if eye_pct >= 70 else ("Moderate Engagement" if eye_pct >= 45 else "Low Eye Contact")
            )

            questions_feedback.append(
                schemas.QuestionReportItem(
                    id=q.id,
                    question_number=q.question_number,
                    category=q.category,
                    question_text=q.question_text,
                    has_answer=True,
                    transcript=ans.transcript,
                    duration_seconds=ans.duration_seconds or 0.0,
                    words_per_minute=ans_wpm,
                    filler_words_count=ans_fillers,
                    filler_words_list=f_list,
                    long_pauses_count=ans_pauses,
                    scores=eval_scores,
                    strengths=st_list,
                    weaknesses=wk_list,
                    improved_sample_answer=ans.improved_answer,
                    body_language=bl_metrics,
                )
            )
        else:
            questions_feedback.append(
                schemas.QuestionReportItem(
                    id=q.id,
                    question_number=q.question_number,
                    category=q.category,
                    question_text=q.question_text,
                    has_answer=False,
                )
            )

    # Calculate average scores
    if answered_count > 0:
        avg_quality = sum(quality_scores_list) / answered_count
        avg_speech = sum(speech_scores_list) / answered_count
        avg_bl = sum(bl_scores_list) / answered_count

        avg_wpm = round(total_wpm / answered_count, 1)
        avg_eye = round(total_eye_pct / answered_count, 1)
        avg_head = round(total_head_pct / answered_count, 1)
        avg_smile = round(total_smile_pct / answered_count, 1)
        avg_face = round(total_face_pct / answered_count, 1)
    else:
        avg_quality = 0.0
        avg_speech = 0.0
        avg_bl = 0.0
        avg_wpm = 0.0
        avg_eye = 0.0
        avg_head = 0.0
        avg_smile = 0.0
        avg_face = 0.0

    # Composite Overall Score: Speech 30%, Answer Quality 40%, Body Language 30%
    overall_composite = (avg_speech * 0.30) + (avg_quality * 0.40) + (avg_bl * 0.30)
    overall_score = round(overall_composite, 1)
    overall_percentage = round(overall_score * 10.0, 1)

    # Verdict
    if overall_score >= 8.5:
        verdict = "Exceptional - Ready for Top Tier Roles"
    elif overall_score >= 7.0:
        verdict = "Strong Performance - Ready for Interviews"
    elif overall_score >= 5.5:
        verdict = "Promising - Practice Structured Delivery"
    else:
        verdict = "Needs Focused Preparation & Practice"

    # Pace Verdict
    if 120 <= avg_wpm <= 160:
        pace_verdict = "Optimal Cadence (120-160 WPM)"
    elif avg_wpm < 120 and avg_wpm > 0:
        pace_verdict = "Slightly Deliberate / Slow (<120 WPM)"
    elif avg_wpm > 160:
        pace_verdict = "Rapid / Fast Pace (>160 WPM)"
    else:
        pace_verdict = "No speech data"

    # Body Language Verdict
    if avg_eye >= 70 and avg_face >= 80:
        bl_verdict = "Excellent Camera Presence & Eye Contact"
    elif avg_eye >= 50:
        bl_verdict = "Good Engagement with Room for Stability"
    else:
        bl_verdict = "Low Eye Contact - Focus on Camera Lens"

    # Filler Words Chart Data Breakdown
    filler_counts = Counter(all_fillers)
    filler_breakdown = [{"name": word, "count": count} for word, count in filler_counts.most_common(8)]

    # Deduplicate strengths & weaknesses preserving order
    unique_strengths = list(dict.fromkeys(all_strengths))[:6]
    unique_weaknesses = list(dict.fromkeys(all_weaknesses))[:6]

    # Generate Actionable Improvement Tips
    improvement_tips = []
    if avg_wpm > 0 and avg_wpm < 115:
        improvement_tips.append("⚡ Increase your speaking pace slightly towards 130-150 WPM to project high energy and assertiveness.")
    elif avg_wpm > 165:
        improvement_tips.append("🎯 Slow down your speaking tempo on key technical explanations so interviewers can absorb complex points.")

    if total_fillers_count > 3:
        top_filler = filler_breakdown[0]["name"] if filler_breakdown else "filler words"
        improvement_tips.append(f"🤫 Substitute '{top_filler}' and habitual vocal fillers with brief 1-second silent pauses to structure your thoughts.")

    if total_long_pauses > 2:
        improvement_tips.append("💡 Bridge hesitation by acknowledging the question proactively (e.g. 'That is a critical challenge, here is my approach...').")

    if avg_eye < 65:
        improvement_tips.append("👁️ Keep your gaze centered on the webcam lens rather than looking away or looking down while thinking.")

    if avg_quality < 7.5:
        improvement_tips.append("📐 Anchor your answers in the STAR framework (Situation, Task, Action, Result) with concrete metrics and outcomes.")

    if len(improvement_tips) < 3:
        improvement_tips.append("🚀 Review the AI-generated model answers below to learn concise phrasing and high-impact terminology.")
        improvement_tips.append("🌟 Maintain an upright posture and warm conversational smile to build rapport with your interviewer.")

    return schemas.InterviewReportResponse(
        interview_id=interview.id,
        role=interview.role,
        language=interview.language,
        status=interview.status,
        created_at=interview.created_at,
        total_questions=total_q,
        answered_questions=answered_count,
        scores=schemas.OverallScoreBreakdown(
            overall_score=overall_score,
            overall_percentage=overall_percentage,
            speech_score=round(avg_speech, 1),
            answer_quality_score=round(avg_quality, 1),
            body_language_score=round(avg_bl, 1),
            weights={"speech": 0.30, "answer_quality": 0.40, "body_language": 0.30},
            verdict=verdict,
        ),
        speech_summary=schemas.SpeechSummary(
            avg_wpm=avg_wpm,
            pace_verdict=pace_verdict,
            total_filler_words=total_fillers_count,
            filler_breakdown=filler_breakdown,
            total_long_pauses=total_long_pauses,
        ),
        body_language_summary=schemas.BodyLanguageSummary(
            avg_eye_contact_pct=avg_eye,
            avg_head_stability_pct=avg_head,
            avg_smile_pct=avg_smile,
            avg_face_visible_pct=avg_face,
            verdict=bl_verdict,
        ),
        aggregated_strengths=unique_strengths,
        aggregated_weaknesses=unique_weaknesses,
        improvement_tips=improvement_tips[:5],
        questions_feedback=questions_feedback,
    )


@router.post(
    "/start",
    response_model=schemas.InterviewResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Start an interview and generate 5 questions via LLM"
)
def start_interview(
    request: schemas.InterviewStartRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Starts a new interview session:
    1. Authenticates candidate
    2. Calls LLM service to generate 5 fresher-level questions (mix of HR + Technical) in selected language
    3. Persists Interview and Question records in PostgreSQL
    4. Returns interview object containing all 5 questions
    """
    role = request.role.strip()
    language = request.language.strip()

    if not role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role cannot be empty."
        )

    # 1. Generate 5 interview questions via LLM service
    try:
        raw_questions = generate_interview_questions(role=role, language=language)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate interview questions: {str(exc)}"
        )

    # 2. Create Interview DB record
    new_interview = models.Interview(
        user_id=current_user.id,
        role=role,
        language=language,
        status="in_progress",
    )
    db.add(new_interview)
    db.flush()

    # 3. Create Question DB records
    for q_data in raw_questions:
        q = models.Question(
            interview_id=new_interview.id,
            question_number=q_data["question_number"],
            category=q_data["category"],
            question_text=q_data["question_text"],
        )
        db.add(q)

    db.commit()
    db.refresh(new_interview)
    return new_interview


@router.get(
    "/history",
    response_model=List[schemas.InterviewHistoryItem],
    summary="Get user's past interview sessions and score progress"
)
def get_interview_history(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns candidate's chronological list of interviews with calculated scores
    for progress dashboard line charts.
    """
    interviews = db.query(models.Interview).filter(
        models.Interview.user_id == current_user.id
    ).order_by(models.Interview.created_at.desc()).all()

    history_items = []
    for it in interviews:
        report_data = generate_interview_report_payload(it)
        history_items.append(
            schemas.InterviewHistoryItem(
                id=it.id,
                role=it.role,
                language=it.language,
                status=it.status,
                created_at=it.created_at,
                total_questions=report_data.total_questions,
                answered_questions=report_data.answered_questions,
                overall_score=report_data.scores.overall_score,
                speech_score=report_data.scores.speech_score,
                answer_quality_score=report_data.scores.answer_quality_score,
                body_language_score=report_data.scores.body_language_score,
                verdict=report_data.scores.verdict,
            )
        )

    return history_items


@router.get(
    "/{interview_id}/report",
    response_model=schemas.InterviewReportResponse,
    summary="Get comprehensive interview report with 30-40-30 weighting, charts, and tips"
)
def get_interview_report(
    interview_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Calculates and returns full report for an interview:
    - Speech (30%) + Answer Quality (40%) + Body Language (30%)
    - Strengths, Weaknesses, Improvement Tips
    - Filler Word breakdown
    - Per-question evaluations
    """
    interview = db.query(models.Interview).filter(
        models.Interview.id == interview_id,
        models.Interview.user_id == current_user.id
    ).first()

    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found or does not belong to your account."
        )

    # Mark interview as completed if all or majority of questions are answered
    if len(interview.answers) > 0 and interview.status != "completed":
        interview.status = "completed"
        db.commit()
        db.refresh(interview)

    return generate_interview_report_payload(interview)


@router.get(
    "/{interview_id}",
    response_model=schemas.InterviewResponse,
    summary="Get interview details and questions"
)
def get_interview_details(
    interview_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves an existing interview session by ID."""
    interview = db.query(models.Interview).filter(
        models.Interview.id == interview_id,
        models.Interview.user_id == current_user.id
    ).first()

    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found."
        )

    return interview

