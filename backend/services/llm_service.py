"""
MockMate AI - LLM Service
Generates interview questions and evaluates candidate answers (relevance, structure, depth, communication)
in English or Tamil with Gemini API, OpenAI API, and robust fallback algorithms.
"""

import os
import json
import re
import httpx
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()


# ==========================================
# 1. QUESTION GENERATION LOGIC
# ==========================================

def _get_fallback_questions(role: str, language: str) -> List[Dict[str, Any]]:
    """Structured fresher fallback questions if external LLM API is unreachable."""
    is_tamil = "tamil" in language.lower()
    normalized_role = role.lower()

    if "software" in normalized_role or "developer" in normalized_role or "engineer" in normalized_role:
        if is_tamil:
            return [
                {
                    "question_number": 1,
                    "category": "hr",
                    "question_text": "உங்களைப் பற்றி சுருக்கமாக அறிமுகப்படுத்துங்கள் மற்றும் மென்பொருள் உருவாக்கத்தில் உங்கள் ஆர்வம் எவ்வாறு தொடங்கியது?",
                },
                {
                    "question_number": 2,
                    "category": "technical",
                    "question_text": "Object-Oriented Programming (OOPs) இன் முக்கிய நான்கு கருத்துக்கள் (Four Pillars) என்னென்ன? சுருக்கமாக விளக்குங்கள்.",
                },
                {
                    "question_number": 3,
                    "category": "technical",
                    "question_text": "Array மற்றும் Linked List ஆகியவற்றுக்கு இடையே உள்ள முக்கிய வேறுபாடுகள் யாவை? எப்போது எதைப் பயன்படுத்த வேண்டும்?",
                },
                {
                    "question_number": 4,
                    "category": "technical",
                    "question_text": "RESTful API என்றால் என்ன? GET மற்றும் POST முறைகளுக்கு இடையேயான வேறுபாட்டை விளக்குங்கள்.",
                },
                {
                    "question_number": 5,
                    "category": "hr",
                    "question_text": "ஒரு புதிய தொழில்நுட்பம் அல்லது Programming Framework-ஐ நீங்கள் குறுகிய காலத்தில் கற்றுக்கொண்ட அனுபவத்தைப் பகிருங்கள்.",
                },
            ]
        else:
            return [
                {
                    "question_number": 1,
                    "category": "hr",
                    "question_text": "Please introduce yourself briefly and tell us what inspired you to pursue software development.",
                },
                {
                    "question_number": 2,
                    "category": "technical",
                    "question_text": "Explain the four core principles of Object-Oriented Programming (OOP) with real-world examples.",
                },
                {
                    "question_number": 3,
                    "category": "technical",
                    "question_text": "What is the difference between an Array and a Linked List in terms of memory allocation and time complexity?",
                },
                {
                    "question_number": 4,
                    "category": "technical",
                    "question_text": "What is a RESTful API? Explain the key differences between GET and POST HTTP methods.",
                },
                {
                    "question_number": 5,
                    "category": "hr",
                    "question_text": "Describe a challenging technical project or bug you solved during your college studies and what you learned from it.",
                },
            ]

    elif "data" in normalized_role or "analyst" in normalized_role:
        if is_tamil:
            return [
                {
                    "question_number": 1,
                    "category": "hr",
                    "question_text": "உங்களை அறிமுகப்படுத்திக் கொண்டு, Data Analysis துறையை நீங்கள் தேர்வு செய்ததற்கான காரணத்தைக் கூறுங்கள்.",
                },
                {
                    "question_number": 2,
                    "category": "technical",
                    "question_text": "SQL-ல் WHERE மற்றும் HAVING clauses-க்கு இடையே உள்ள முக்கிய வேறுபாடு என்ன?",
                },
                {
                    "question_number": 3,
                    "category": "technical",
                    "question_text": "Data Cleaning என்றால் என்ன? ஒரு Dataset-ல் விடுபட்ட மதிப்புகளை (Missing values) நீங்கள் எவ்வாறு கையாள்வீர்கள்?",
                },
                {
                    "question_number": 4,
                    "category": "technical",
                    "question_text": "INNER JOIN மற்றும் LEFT JOIN ஆகியவற்றுக்கு இடையேயான வித்தியாசத்தை உதாரணத்துடன் விளக்குங்கள்.",
                },
                {
                    "question_number": 5,
                    "category": "hr",
                    "question_text": "ஒரு முக்கியமான முடிவை எடுப்பதற்கு நீங்கள் தரவுகளை (Data) பயன்படுத்திய அனுபவம் ஏதேனும் உள்ளதா? விளக்குங்கள்.",
                },
            ]
        else:
            return [
                {
                    "question_number": 1,
                    "category": "hr",
                    "question_text": "Tell us about yourself and what sparked your enthusiasm for data analytics and problem solving.",
                },
                {
                    "question_number": 2,
                    "category": "technical",
                    "question_text": "What is the key difference between WHERE and HAVING clauses in SQL?",
                },
                {
                    "question_number": 3,
                    "category": "technical",
                    "question_text": "What is data cleaning, and how do you identify and handle missing or corrupted values in a dataset?",
                },
                {
                    "question_number": 4,
                    "category": "technical",
                    "question_text": "Explain the difference between INNER JOIN, LEFT JOIN, and RIGHT JOIN with a simple example.",
                },
                {
                    "question_number": 5,
                    "category": "hr",
                    "question_text": "How do you explain complex data insights or charts to team members who do not have a technical background?",
                },
            ]

    elif "ai" in normalized_role or "ml" in normalized_role or "machine learning" in normalized_role or "data scientist" in normalized_role:
        if is_tamil:
            return [
                {
                    "question_number": 1,
                    "category": "hr",
                    "question_text": "உங்களை அறிமுகப்படுத்திக் கொண்டு, Artificial Intelligence மற்றும் Machine Learning துறையில் உங்கள் ஆர்வத்தை விளக்குங்கள்.",
                },
                {
                    "question_number": 2,
                    "category": "technical",
                    "question_text": "Supervised Learning மற்றும் Unsupervised Learning ஆகியவற்றுக்கு இடையே உள்ள முக்கிய வேறுபாடுகள் யாவை? உதாரணங்களுடன் விளக்குங்கள்.",
                },
                {
                    "question_number": 3,
                    "category": "technical",
                    "question_text": "Machine Learning Model-ல் Overfitting என்றால் என்ன? அதை எவ்வாறு தடுப்பது (Regularization, Dropout)?",
                },
                {
                    "question_number": 4,
                    "category": "technical",
                    "question_text": "Large Language Models (LLMs) மற்றும் Prompt Engineering என்றால் என்ன? இதன் பயன்கள் என்ன?",
                },
                {
                    "question_number": 5,
                    "category": "hr",
                    "question_text": "ஒரு புதிய AI ஆராய்ச்சி அல்லது கருவியை (Tool) விரைவாகக் கற்று செயல்படுத்திய அனுபவத்தைப் பகிருங்கள்.",
                },
            ]
        else:
            return [
                {
                    "question_number": 1,
                    "category": "hr",
                    "question_text": "Please introduce yourself and explain what motivated you to specialize in Artificial Intelligence and Machine Learning.",
                },
                {
                    "question_number": 2,
                    "category": "technical",
                    "question_text": "What is the difference between Supervised, Unsupervised, and Reinforcement Learning? Provide concrete examples.",
                },
                {
                    "question_number": 3,
                    "category": "technical",
                    "question_text": "What is Overfitting in Machine Learning models, and what techniques do you use to mitigate it?",
                },
                {
                    "question_number": 4,
                    "category": "technical",
                    "question_text": "Explain how embeddings and Vector Databases work in modern Generative AI and RAG architectures.",
                },
                {
                    "question_number": 5,
                    "category": "hr",
                    "question_text": "Describe a machine learning project you built, the evaluation metrics you chose, and how you improved accuracy.",
                },
            ]

    elif "devops" in normalized_role or "cloud" in normalized_role or "infrastructure" in normalized_role:
        if is_tamil:
            return [
                {
                    "question_number": 1,
                    "category": "hr",
                    "question_text": "உங்களை அறிமுகப்படுத்திக் கொண்டு, DevOps மற்றும் Cloud Engineering துறையைத் தேர்வு செய்ததற்கான காரணத்தைக் கூறுங்கள்.",
                },
                {
                    "question_number": 2,
                    "category": "technical",
                    "question_text": "CI/CD (Continuous Integration and Continuous Deployment) Pipeline-ன் முக்கியத்துவம் என்ன?",
                },
                {
                    "question_number": 3,
                    "category": "technical",
                    "question_text": "Docker Containerization மற்றும் Virtual Machine (VM) ஆகியவற்றுக்கு இடையேயான முக்கிய வேறுபாடுகள் என்ன?",
                },
                {
                    "question_number": 4,
                    "category": "technical",
                    "question_text": "Kubernetes என்றால் என்ன? Pods மற்றும் Services எவ்வாறு செயல்படுகின்றன?",
                },
                {
                    "question_number": 5,
                    "category": "hr",
                    "question_text": "ஒரு சர்வர் கோளாறு அல்லது Deployment சிக்கலை நீங்கள் அமைதியாகத் தீர்த்த அனுபவத்தைப் பகிர்ந்து கொள்ளுங்கள்.",
                },
            ]
        else:
            return [
                {
                    "question_number": 1,
                    "category": "hr",
                    "question_text": "Tell us about yourself and what drives your passion for DevOps, Automation, and Cloud Infrastructure.",
                },
                {
                    "question_number": 2,
                    "category": "technical",
                    "question_text": "What is a CI/CD pipeline, and what are the core stages involved from code commit to production deployment?",
                },
                {
                    "question_number": 3,
                    "category": "technical",
                    "question_text": "Explain the architectural differences between Docker containers and traditional Virtual Machines.",
                },
                {
                    "question_number": 4,
                    "category": "technical",
                    "question_text": "What is Infrastructure as Code (IaC) and how does Terraform or CloudFormation benefit team reliability?",
                },
                {
                    "question_number": 5,
                    "category": "hr",
                    "question_text": "Describe how you would handle an urgent production outage under high-pressure conditions.",
                },
            ]

    elif "product" in normalized_role or "pm" in normalized_role or "manager" in normalized_role:
        if is_tamil:
            return [
                {
                    "question_number": 1,
                    "category": "hr",
                    "question_text": "உங்களை அறிமுகப்படுத்திக் கொண்டு, Product Management துறையில் நீங்கள் கொண்டுள்ள ஆர்வத்தை விளக்குங்கள்.",
                },
                {
                    "question_number": 2,
                    "category": "technical",
                    "question_text": "ஒரு புதிய மொபைல் செயலியை உருவாக்கும் போது, அம்சங்களை (Features) எவ்வாறு RICE அல்லது MoSCoW முறைப்படி முன்னுரிமைப்படுத்துவீர்கள்?",
                },
                {
                    "question_number": 3,
                    "category": "technical",
                    "question_text": "ஒரு தயாரிப்பின் வெற்றியை அளவிட நீங்கள் கண்காணிக்கும் முக்கிய KPIs மற்றும் North Star Metric என்ன?",
                },
                {
                    "question_number": 4,
                    "category": "technical",
                    "question_text": "A/B Testing என்றால் என்ன? ஒரு மாற்றத்தை முழுமையாக வெளியிடுவதற்கு முன் அதை எவ்வாறு பகுப்பாய்வு செய்வீர்கள்?",
                },
                {
                    "question_number": 5,
                    "category": "hr",
                    "question_text": "பொறியியல் குழு மற்றும் வாடிக்கையாளர் தேவைகளுக்கு இடையே சமநிலையை நீங்கள் எவ்வாறு பேணுவீர்கள்?",
                },
            ]
        else:
            return [
                {
                    "question_number": 1,
                    "category": "hr",
                    "question_text": "Introduce yourself and explain what makes you excited about solving customer problems through Product Management.",
                },
                {
                    "question_number": 2,
                    "category": "technical",
                    "question_text": "How do you prioritize competing product feature requests using frameworks like RICE or Kano Model?",
                },
                {
                    "question_number": 3,
                    "category": "technical",
                    "question_text": "What is a North Star Metric, and how would you define success metrics for an AI mock interview app?",
                },
                {
                    "question_number": 4,
                    "category": "technical",
                    "question_text": "Explain the step-by-step process of designing and validating an A/B test for candidate onboarding.",
                },
                {
                    "question_number": 5,
                    "category": "hr",
                    "question_text": "Tell me about a time you had to say 'no' to a stakeholder or leadership request in favor of user experience.",
                },
            ]

    else:  # HR or General Behavioral
        if is_tamil:
            return [
                {
                    "question_number": 1,
                    "category": "hr",
                    "question_text": "உங்களைப் பற்றி சுருக்கமாகக் கூறுங்கள் மற்றும் உங்கள் மிகப்பெரிய பலம் மற்றும் பலவீனம் என்ன?",
                },
                {
                    "question_number": 2,
                    "category": "hr",
                    "question_text": "குழுவில் (Team) பணிபுரியும் போது கருத்து வேறுபாடு ஏற்பட்டால், அதை நீங்கள் எவ்வாறு சுமுகமாகத் தீர்ப்பீர்கள்?",
                },
                {
                    "question_number": 3,
                    "category": "technical",
                    "question_text": "பணியிடத்தில் நேர மேலாண்மை (Time Management) மற்றும் பணிகளின் முன்னுரிமையை (Prioritization) நீங்கள் எவ்வாறு திட்டமிடுவீர்கள்?",
                },
                {
                    "question_number": 4,
                    "category": "hr",
                    "question_text": "அழுத்தமான சூழலிலும் இறுதிக்கெடுவை (Deadlines) திறம்பட எதிர்கொண்ட அனுபவத்தைப் பகிர்ந்து கொள்ளுங்கள்.",
                },
                {
                    "question_number": 5,
                    "category": "hr",
                    "question_text": "அடுத்த 3 முதல் 5 ஆண்டுகளில் உங்கள் தொழில் வாழ்க்கையில் உங்களை எங்கு பார்க்க விரும்புகிறீர்கள்?",
                },
            ]
        else:
            return [
                {
                    "question_number": 1,
                    "category": "hr",
                    "question_text": "Tell me about yourself, your background, and what your greatest strength is as a fresher.",
                },
                {
                    "question_number": 2,
                    "category": "hr",
                    "question_text": "How do you handle disagreement or constructive feedback from a teammate or manager?",
                },
                {
                    "question_number": 3,
                    "category": "technical",
                    "question_text": "How do you prioritize your daily tasks when multiple deadlines happen to coincide?",
                },
                {
                    "question_number": 4,
                    "category": "hr",
                    "question_text": "Describe a time when you worked under pressure to complete a college assignment or project on time.",
                },
                {
                    "question_number": 5,
                    "category": "hr",
                    "question_text": "Where do you see yourself professionally in the next 3 to 5 years?",
                },
            ]


def _clean_and_parse_json(content: str) -> Any:
    """Extracts and parses JSON from LLM response text, stripping markdown blocks."""
    cleaned = content.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\n?", "", cleaned)
        cleaned = re.sub(r"\n?```$", "", cleaned)
        cleaned = cleaned.strip()
    return json.loads(cleaned)


def generate_interview_questions(role: str, language: str) -> List[Dict[str, Any]]:
    """Generates 5 interview questions for a fresher in English or Tamil."""
    system_instruction = (
        "You are an expert AI Technical Recruiter and Hiring Manager conducting mock interviews. "
        "Generate exactly 5 interview questions tailored for an entry-level fresher candidate. "
        "The mix MUST include 2-3 technical questions relevant to the target role and 2-3 behavioral/HR questions. "
        "The language of ALL generated question texts MUST strictly be in the specified language (English or Tamil script). "
        "You MUST respond ONLY with a raw JSON array containing exactly 5 items and NO extra commentary.\n\n"
        "Required JSON schema:\n"
        "[\n"
        '  {"question_number": 1, "category": "hr", "question_text": "..."},\n'
        "  ...\n"
        "]"
    )

    user_prompt = (
        f"Target Role: {role}\n"
        f"Candidate Level: Fresher / Entry Level\n"
        f"Interview Language: {language}\n\n"
        f"Generate exactly 5 interview questions in {language} following the specified JSON array format."
    )

    # 1. Try Gemini API
    if GEMINI_API_KEY:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
            payload = {
                "contents": [{"role": "user", "parts": [{"text": f"{system_instruction}\n\n{user_prompt}"}]}],
                "generationConfig": {"responseMimeType": "application/json", "temperature": 0.7}
            }
            with httpx.Client(timeout=15.0) as client:
                res = client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    candidate_text = data["candidates"][0]["content"]["parts"][0]["text"]
                    parsed = _clean_and_parse_json(candidate_text)
                    if isinstance(parsed, dict) and "questions" in parsed:
                        parsed = parsed["questions"]
                    if isinstance(parsed, list) and len(parsed) >= 5:
                        return [
                            {
                                "question_number": i + 1,
                                "category": str(q.get("category", "technical")).lower(),
                                "question_text": str(q.get("question_text") or q.get("question") or "").strip(),
                            }
                            for i, q in enumerate(parsed[:5])
                        ]
        except Exception as e:
            print(f"[LLM Service Warning] Error calling Gemini API for questions: {e}")

    # 2. Try OpenAI API
    if OPENAI_API_KEY:
        try:
            url = "https://api.openai.com/v1/chat/completions"
            headers = {"Authorization": f"Bearer {OPENAI_API_KEY}", "Content-Type": "application/json"}
            payload = {
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": 0.7,
                "response_format": {"type": "json_object"}
            }
            with httpx.Client(timeout=15.0) as client:
                res = client.post(url, headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    content = data["choices"][0]["message"]["content"]
                    parsed = _clean_and_parse_json(content)
                    if isinstance(parsed, dict) and "questions" in parsed:
                        parsed = parsed["questions"]
                    if isinstance(parsed, list) and len(parsed) >= 5:
                        return [
                            {
                                "question_number": i + 1,
                                "category": str(q.get("category", "technical")).lower(),
                                "question_text": str(q.get("question_text") or q.get("question") or "").strip(),
                            }
                            for i, q in enumerate(parsed[:5])
                        ]
        except Exception as e:
            print(f"[LLM Service Warning] Error calling OpenAI API for questions: {e}")

    # 3. Fallback Question Generator
    return _get_fallback_questions(role, language)


# ==========================================
# 2. ANSWER EVALUATION LOGIC (Phase 6)
# ==========================================

def _get_fallback_evaluation(
    question_text: str,
    role: str,
    language: str,
    transcript: str
) -> Dict[str, Any]:
    """
    Constructive evaluation algorithm for candidate answers if external LLM API is not set.
    Adjusts scores dynamically based on word count, technical vocabulary, and structure.
    """
    is_tamil = "tamil" in language.lower()
    words = transcript.strip().split()
    word_count = len(words)

    # 1. Handle Empty or Very Short Transcripts Gracefully
    if word_count < 5 or "(no speech detected)" in transcript.lower():
        if is_tamil:
            return {
                "scores": {
                    "relevance": 2.0,
                    "structure": 2.0,
                    "depth": 1.5,
                    "communication": 2.0,
                    "overall": 1.9,
                },
                "strengths": [
                    "பதிலளிக்க முயற்சி செய்யப்பட்டது.",
                ],
                "weaknesses": [
                    "பதில் மிகக் குறைவாகவோ அல்லது தெளிவாகப் பேசப்படாமலோ உள்ளது.",
                    "கேள்விக்கு நேரடியான விளக்கமும் உதாரணங்களும் தேவைப்படுகின்றன.",
                ],
                "improved_sample_answer": (
                    f"'{question_text}' என்ற கேள்விக்கு சிறந்த பதில்:\n"
                    "வணக்கம், இந்த கேள்விக்கு ஒரு தெளிவான கட்டமைப்பில் பதிலளிப்பது நல்லது. முதலில் நேரடியான வரையறையைக் கூறி, "
                    "அதன் முக்கியத்துவம் மற்றும் ஒரு நடைமுறை உதாரணத்தை (Real-world example) தெளிவாக விளக்குங்கள்."
                ),
            }
        else:
            return {
                "scores": {
                    "relevance": 2.0,
                    "structure": 2.0,
                    "depth": 1.5,
                    "communication": 2.0,
                    "overall": 1.9,
                },
                "strengths": [
                    "Attempted to provide an answer to the question.",
                ],
                "weaknesses": [
                    "The answer was too brief or speech was unclear/inaudible.",
                    "Missing detailed explanation, key terminology, and concrete examples.",
                ],
                "improved_sample_answer": (
                    f"Ideal sample response for: '{question_text}':\n"
                    "A strong answer should follow the STAR method or structured approach: clearly state the core concept, "
                    "explain why it matters in real-world software/data workflows, and give a concise practical example."
                ),
            }

    # 2. Moderate to Detailed Transcript Evaluation
    # Base score scaling on answer length and depth
    if word_count < 15:
        rel, struct, depth, comm = 5.5, 5.0, 4.5, 5.5
    elif word_count < 40:
        rel, struct, depth, comm = 7.5, 7.0, 6.5, 7.5
    else:
        rel, struct, depth, comm = 8.5, 8.0, 8.0, 8.5

    overall = round((rel * 0.35 + struct * 0.25 + depth * 0.25 + comm * 0.15), 1)

    if is_tamil:
        return {
            "scores": {
                "relevance": rel,
                "structure": struct,
                "depth": depth,
                "communication": comm,
                "overall": overall,
            },
            "strengths": [
                "கேள்விக்கான முக்கிய கருத்தை சரியாகப் புரிந்து கொண்டு பேசினீர்கள்.",
                "சுருக்கமான மற்றும் பொருத்தமான தகவல்களை வழங்கினீர்கள்.",
            ],
            "weaknesses": [
                "நடைமுறை பயன்பாட்டு உதாரணங்களை (Real-world examples) மேலும் விரிவாகச் சேர்க்கலாம்.",
                "தொழில்நுட்ப சொற்களை (Technical terms) இன்னும் துல்லியமாகப் பயன்படுத்தலாம்.",
            ],
            "improved_sample_answer": (
                f"'{question_text}' கேள்விக்கான மேம்படுத்தப்பட்ட சிறந்த பதில்:\n"
                "வணக்கம், இந்த கருத்தை நாம் எளிய உதாரணத்துடன் விளக்கலாம். முதலில் முக்கிய தத்துவத்தை விளக்கி, "
                "நிறுவனத்தில் அல்லது ப்ராஜெக்ட்டில் இது எவ்வாறு செயல்திறனை மேம்படுத்துகிறது என்பதைப் பகிர்வது நேர்காணல் செய்பவரை ஈர்க்கும்."
            ),
        }
    else:
        return {
            "scores": {
                "relevance": rel,
                "structure": struct,
                "depth": depth,
                "communication": comm,
                "overall": overall,
            },
            "strengths": [
                "Understood the core premise of the question well.",
                "Clear voice modulation and direct addressing of the topic.",
            ],
            "weaknesses": [
                "Could include more specific real-world examples or industry use-cases.",
                "Structure can be strengthened using the STAR (Situation, Task, Action, Result) methodology.",
            ],
            "improved_sample_answer": (
                f"Model Answer for '{question_text}':\n"
                "To deliver an outstanding response, start with a concise high-level definition, explain the underlying mechanism "
                "or workflow, and conclude with a specific project experience highlighting measurable outcomes."
            ),
        }


def evaluate_candidate_answer(
    question_text: str,
    role: str,
    language: str,
    transcript: str
) -> Dict[str, Any]:
    """
    Evaluates candidate transcript using LLM on relevance, structure, depth, communication (each /10),
    providing actionable strengths, weaknesses, and an improved sample answer in the requested language.
    """
    transcript_clean = transcript.strip()
    words = transcript_clean.split()

    # Fast-path for empty or inaudible transcript
    if len(words) < 4 or "(no speech detected)" in transcript_clean.lower():
        return _get_fallback_evaluation(question_text, role, language, transcript_clean)

    system_instruction = (
        "You are a rigorous, highly insightful AI Interview Coach and Technical Hiring Manager. "
        "Evaluate the candidate's transcribed spoken answer to an interview question. "
        "The candidate is an entry-level fresher applying for the specified job role. "
        "You MUST score each of the following 4 criteria out of 10 (floating point numbers between 1.0 and 10.0):\n"
        "1. relevance: How accurately and directly does the answer address the question?\n"
        "2. structure: Is the answer logically organized with a clear beginning, body, and conclusion?\n"
        "3. depth: Did the candidate demonstrate foundational technical/domain knowledge or behavioral nuance?\n"
        "4. communication: Clarity of thought, tone, and professional articulation.\n"
        "5. overall: Weighted overall score out of 10.0.\n\n"
        "Also provide:\n"
        "- strengths: An array of 2-3 specific positive qualities in their answer.\n"
        "- weaknesses: An array of 2-3 actionable areas for improvement.\n"
        "- improved_sample_answer: A polished, high-scoring model answer strictly written in the candidate's chosen language (English or Tamil script).\n\n"
        "You MUST reply ONLY with a raw JSON object matching the schema:\n"
        "{\n"
        '  "scores": {\n'
        '    "relevance": 8.0,\n'
        '    "structure": 7.5,\n'
        '    "depth": 7.0,\n'
        '    "communication": 8.5,\n'
        '    "overall": 7.8\n'
        "  },\n"
        '  "strengths": ["...", "..."],\n'
        '  "weaknesses": ["...", "..."],\n'
        '  "improved_sample_answer": "..."\n'
        "}"
    )

    user_prompt = (
        f"Job Role: {role}\n"
        f"Language: {language}\n"
        f"Question: {question_text}\n"
        f"Candidate Spoken Transcript: {transcript_clean}\n\n"
        f"Evaluate this response thoroughly and generate the structured JSON evaluation in {language}."
    )

    # 1. Try Gemini API
    if GEMINI_API_KEY:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
            payload = {
                "contents": [{"role": "user", "parts": [{"text": f"{system_instruction}\n\n{user_prompt}"}]}],
                "generationConfig": {"responseMimeType": "application/json", "temperature": 0.4}
            }
            with httpx.Client(timeout=15.0) as client:
                res = client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    candidate_text = data["candidates"][0]["content"]["parts"][0]["text"]
                    parsed = _clean_and_parse_json(candidate_text)
                    if isinstance(parsed, dict) and "scores" in parsed and "improved_sample_answer" in parsed:
                        return parsed
        except Exception as e:
            print(f"[LLM Service Warning] Gemini API evaluation error: {e}")

    # 2. Try OpenAI API
    if OPENAI_API_KEY:
        try:
            url = "https://api.openai.com/v1/chat/completions"
            headers = {"Authorization": f"Bearer {OPENAI_API_KEY}", "Content-Type": "application/json"}
            payload = {
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": 0.4,
                "response_format": {"type": "json_object"}
            }
            with httpx.Client(timeout=15.0) as client:
                res = client.post(url, headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    content = data["choices"][0]["message"]["content"]
                    parsed = _clean_and_parse_json(content)
                    if isinstance(parsed, dict) and "scores" in parsed and "improved_sample_answer" in parsed:
                        return parsed
        except Exception as e:
            print(f"[LLM Service Warning] OpenAI API evaluation error: {e}")

    # 3. Use Smart Fallback Evaluator
    return _get_fallback_evaluation(question_text, role, language, transcript_clean)
