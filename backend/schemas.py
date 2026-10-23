"""
MockMate AI - Pydantic Schemas
Defines request and response data contracts for auth, interviews, questions,
speech metrics, LLM evaluation, and MediaPipe body language analytics.
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field


# --- User Schemas ---
class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Full name of candidate")
    email: EmailStr = Field(..., description="Valid email address")
    password: str = Field(..., min_length=6, max_length=128, description="Password (min 6 characters)")


class UserLogin(BaseModel):
    email: EmailStr = Field(..., description="Registered email address")
    password: str = Field(..., description="Account password")


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# --- Interview & Question Schemas ---
class InterviewStartRequest(BaseModel):
    role: str = Field(
        ...,
        description="Target job role (e.g., 'Software Developer', 'Data Analyst', 'HR')",
        example="Software Developer"
    )
    language: str = Field(
        default="English",
        description="Interview language ('English' or 'Tamil')",
        example="English"
    )


class QuestionResponse(BaseModel):
    id: int
    question_number: int
    category: str
    question_text: str

    class Config:
        from_attributes = True


class GeneratedQuestion(BaseModel):
    question_number: int
    category: str
    question_text: str


class InterviewResponse(BaseModel):
    id: int
    role: str
    language: str
    status: str
    created_at: datetime
    questions: List[QuestionResponse]

    class Config:
        from_attributes = True


# --- Speech Analysis Schemas (Phase 5) ---
class SpeechMetrics(BaseModel):
    duration_seconds: float = 0.0
    words_per_minute: float = 0.0
    filler_words_count: int = 0
    filler_words_detected: List[str] = []
    long_pauses_count: int = 0
    pace_assessment: str = "Optimal"  # "Slow", "Optimal", "Fast"


# --- LLM Answer Evaluation Schemas (Phase 6) ---
class EvaluationScores(BaseModel):
    relevance: float = Field(..., ge=0.0, le=10.0, description="Score for question relevance (0-10)")
    structure: float = Field(..., ge=0.0, le=10.0, description="Score for structure and logical flow (0-10)")
    depth: float = Field(..., ge=0.0, le=10.0, description="Score for technical/behavioral depth (0-10)")
    communication: float = Field(..., ge=0.0, le=10.0, description="Score for clarity and communication (0-10)")
    overall: float = Field(..., ge=0.0, le=10.0, description="Overall weighted score (0-10)")


class AnswerEvaluation(BaseModel):
    scores: EvaluationScores
    strengths: List[str] = Field(default_factory=list, description="Key candidate strengths identified")
    weaknesses: List[str] = Field(default_factory=list, description="Areas where the answer can be improved")
    improved_sample_answer: str = Field(..., description="High-impact model answer in the interview language")


# --- Body Language Metrics Schemas (Phase 7) ---
class BodyLanguageMetrics(BaseModel):
    eye_contact_pct: float = Field(0.0, ge=0.0, le=100.0, description="Eye contact with camera percentage (0-100%)")
    head_tilt_pct: float = Field(0.0, ge=0.0, le=100.0, description="Head posture stability percentage (0-100%)")
    smile_pct: float = Field(0.0, ge=0.0, le=100.0, description="Smiling expression percentage (0-100%)")
    face_visible_pct: float = Field(0.0, ge=0.0, le=100.0, description="Face visibility during answer percentage (0-100%)")
    assessment: str = "Good Engagement"


class AnswerUploadResponse(BaseModel):
    id: int
    interview_id: int
    question_id: int
    audio_file_path: str
    transcript: Optional[str] = None
    metrics: SpeechMetrics
    evaluation: Optional[AnswerEvaluation] = None
    body_language: Optional[BodyLanguageMetrics] = None
    message: str = "Audio answer transcribed, evaluated, and saved successfully with body language metrics."
    created_at: datetime

    class Config:
        from_attributes = True


# --- Phase 8: Report & Progress Schemas ---
class OverallScoreBreakdown(BaseModel):
    overall_score: float = Field(..., description="Weighted composite score out of 10")
    overall_percentage: float = Field(..., description="Overall score out of 100%")
    speech_score: float = Field(..., description="Speech fluency score out of 10 (30% weight)")
    answer_quality_score: float = Field(..., description="LLM answer quality score out of 10 (40% weight)")
    body_language_score: float = Field(..., description="Body language score out of 10 (30% weight)")
    weights: dict = {"speech": 0.30, "answer_quality": 0.40, "body_language": 0.30}
    verdict: str = "Ready for Interviews"


class SpeechSummary(BaseModel):
    avg_wpm: float = 0.0
    pace_verdict: str = "Optimal (120-160 WPM)"
    total_filler_words: int = 0
    filler_breakdown: List[dict] = []  # [{ "name": "um", "count": 4 }]
    total_long_pauses: int = 0


class BodyLanguageSummary(BaseModel):
    avg_eye_contact_pct: float = 0.0
    avg_head_stability_pct: float = 0.0
    avg_smile_pct: float = 0.0
    avg_face_visible_pct: float = 0.0
    verdict: str = "Good Presence"


class QuestionReportItem(BaseModel):
    id: int
    question_number: int
    category: str
    question_text: str
    has_answer: bool = False
    transcript: Optional[str] = None
    duration_seconds: float = 0.0
    words_per_minute: float = 0.0
    filler_words_count: int = 0
    filler_words_list: List[str] = []
    long_pauses_count: int = 0
    scores: Optional[EvaluationScores] = None
    strengths: List[str] = []
    weaknesses: List[str] = []
    improved_sample_answer: Optional[str] = None
    body_language: Optional[BodyLanguageMetrics] = None


class InterviewReportResponse(BaseModel):
    interview_id: int
    role: str
    language: str
    status: str
    created_at: datetime
    total_questions: int
    answered_questions: int
    scores: OverallScoreBreakdown
    speech_summary: SpeechSummary
    body_language_summary: BodyLanguageSummary
    aggregated_strengths: List[str]
    aggregated_weaknesses: List[str]
    improvement_tips: List[str]
    questions_feedback: List[QuestionReportItem]


class InterviewHistoryItem(BaseModel):
    id: int
    role: str
    language: str
    status: str
    created_at: datetime
    total_questions: int
    answered_questions: int
    overall_score: float
    speech_score: float
    answer_quality_score: float
    body_language_score: float
    verdict: str

