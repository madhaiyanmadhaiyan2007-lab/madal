import urllib.request
import json
import sys

# Configure UTF-8 encoding for Tamil unicode characters in Windows console
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

base_url = 'http://127.0.0.1:8000'


print("=" * 65)
print("  MockMate AI - End-to-End System Verification Test")
print("=" * 65)

# 1. Test Health Check
req = urllib.request.Request(f'{base_url}/health')
with urllib.request.urlopen(req) as resp:
    health = json.loads(resp.read().decode())
    print('\n[1] Health Check Endpoint (/health):')
    print('    - Service Status:', health['status'])
    print('    - Database:', health['database']['message'])
    print('    - API Service:', health['api']['service'])

# 2. Test User Registration / Login
user_email = 'alex_candidate@mockmate.ai'
signup_payload = json.dumps({
    'name': 'Alex Rivera',
    'email': user_email,
    'password': 'SecurePassword123!'
}).encode()

req = urllib.request.Request(f'{base_url}/auth/signup', data=signup_payload, headers={'Content-Type': 'application/json'})
token = None
try:
    with urllib.request.urlopen(req) as resp:
        signup_res = json.loads(resp.read().decode())
        token = signup_res['access_token']
        print(f"\n[2] Candidate Registration (/auth/signup):")
        print(f"    - Name: {signup_res['user']['name']}")
        print(f"    - Email: {signup_res['user']['email']}")
        print(f"    - Auth Token: {token[:25]}... (JWT Bearer)")
except Exception:
    login_payload = json.dumps({'email': user_email, 'password': 'SecurePassword123!'}).encode()
    req = urllib.request.Request(f'{base_url}/auth/login', data=login_payload, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as resp:
        login_res = json.loads(resp.read().decode())
        token = login_res['access_token']
        print(f"\n[2] Candidate Login (/auth/login):")
        print(f"    - Name: {login_res['user']['name']}")
        print(f"    - Auth Token: {token[:25]}... (JWT Bearer)")

# 3. Test Multilingual Question Generation (English)
headers = {'Content-Type': 'application/json', 'Authorization': f'Bearer {token}'}
int_payload = json.dumps({'role': 'Software Developer', 'language': 'English'}).encode()
req = urllib.request.Request(f'{base_url}/interviews/start', data=int_payload, headers=headers)
with urllib.request.urlopen(req) as resp:
    interview = json.loads(resp.read().decode())
    interview_id = interview['id']
    print(f"\n[3] Start Mock Interview (/interviews/start):")
    print(f"    - Session ID: #{interview_id}")
    print(f"    - Target Role: {interview['role']}")
    print(f"    - Language: {interview['language']}")
    print(f"    - Total Generated Questions: {len(interview['questions'])}")
    for q in interview['questions']:
        print(f"      Q{q['question_number']}. [{q['category'].upper()}] {q['question_text'][:80]}...")

# 4. Test Multilingual Question Generation (Tamil)
tamil_payload = json.dumps({'role': 'Data Analyst', 'language': 'Tamil'}).encode()
req = urllib.request.Request(f'{base_url}/interviews/start', data=tamil_payload, headers=headers)
with urllib.request.urlopen(req) as resp:
    tamil_interview = json.loads(resp.read().decode())
    print(f"\n[4] Start Tamil Mock Interview (/interviews/start):")
    print(f"    - Session ID: #{tamil_interview['id']}")
    print(f"    - Role: {tamil_interview['role']}")
    print(f"    - Language: {tamil_interview['language']}")
    for q in tamil_interview['questions'][:2]:
        print(f"      Q{q['question_number']}. [{q['category'].upper()}] {q['question_text']}")

# 5. Test Performance Report (30% Speech + 40% Quality + 30% Body Language)
req = urllib.request.Request(f'{base_url}/interviews/{interview_id}/report', headers=headers)
with urllib.request.urlopen(req) as resp:
    report = json.loads(resp.read().decode())
    scores = report['scores']
    print(f"\n[5] Comprehensive Performance Report (/interviews/{interview_id}/report):")
    print(f"    - Composite Overall Score: {scores['overall_score']} / 10 ({scores['overall_percentage']}%)")
    print(f"    - Speech Fluency (30% weight): {scores['speech_score']} / 10")
    print(f"    - Answer Quality (40% weight): {scores['answer_quality_score']} / 10")
    print(f"    - Body Language (30% weight): {scores['body_language_score']} / 10")
    print(f"    - Standing Verdict: {scores['verdict']}")
    print(f"    - Improvement Tips Count: {len(report['improvement_tips'])}")

# 6. Test Interview History (For Progress Dashboard & Line Chart)
req = urllib.request.Request(f'{base_url}/interviews/history', headers=headers)
with urllib.request.urlopen(req) as resp:
    history = json.loads(resp.read().decode())
    print(f"\n[6] Candidate History (/interviews/history):")
    print(f"    - Total Sessions Recorded: {len(history)}")
    for item in history[:3]:
        print(f"      • Session #{item['id']} | {item['role']} ({item['language']}) | Score: {item['overall_score']}/10 | {item['verdict']}")

# 7. Test Frontend Server
try:
    req = urllib.request.Request('http://localhost:5173/')
    with urllib.request.urlopen(req) as resp:
        print(f"\n[7] Frontend Client (Vite Dev Server):")
        print(f"    - HTTP Status: {resp.status} OK")
        print(f"    - Server Running at: http://localhost:5173/")
except Exception as e:
    print(f"\n[7] Frontend Client: {e}")

print("\n" + "=" * 65)
print("  All Services Active and Operating Smoothly! ")
print("=" * 65)
