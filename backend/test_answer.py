import urllib.request
import json
import io

print("Testing Answer Upload Pipeline...")
login_payload = json.dumps({'email': 'alex_candidate@mockmate.ai', 'password': 'SecurePassword123!'}).encode()
req = urllib.request.Request('http://127.0.0.1:8000/auth/login', data=login_payload, headers={'Content-Type': 'application/json'})
with urllib.request.urlopen(req) as resp:
    token = json.loads(resp.read().decode())['access_token']

int_payload = json.dumps({'role': 'Software Developer', 'language': 'English'}).encode()
req = urllib.request.Request('http://127.0.0.1:8000/interviews/start', data=int_payload, headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {token}'})
with urllib.request.urlopen(req) as resp:
    interview = json.loads(resp.read().decode())

int_id = interview['id']
q_id = interview['questions'][0]['id']

boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
body = io.BytesIO()

def add_field(name, val):
    body.write(f'--{boundary}\r\nContent-Disposition: form-data; name="{name}"\r\n\r\n{val}\r\n'.encode('utf-8'))

add_field('interview_id', str(int_id))
add_field('question_id', str(q_id))
add_field('eye_contact_pct', '88.5')
add_field('head_tilt_pct', '92.0')
add_field('smile_pct', '76.0')
add_field('face_visible_pct', '98.0')

body.write(f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="sample.webm"\r\nContent-Type: audio/webm\r\n\r\n'.encode('utf-8'))
body.write(b'RIFF....WAVEfmt ....data....')
body.write(f'\r\n--{boundary}--\r\n'.encode('utf-8'))

req = urllib.request.Request(
    'http://127.0.0.1:8000/answers/upload',
    data=body.getvalue(),
    headers={
        'Content-Type': f'multipart/form-data; boundary={boundary}',
        'Authorization': f'Bearer {token}'
    }
)
with urllib.request.urlopen(req) as resp:
    ans_res = json.loads(resp.read().decode())
    print("\n[OK] Answer Upload & Evaluation:")
    print("  - Transcript:", ans_res['transcript'][:60], "...")
    print("  - Overall Answer Score:", ans_res['evaluation']['scores']['overall'], "/ 10")
    print("  - Body Language Tracked:", ans_res['body_language'])

req = urllib.request.Request(f'http://127.0.0.1:8000/interviews/{int_id}/report', headers={'Authorization': f'Bearer {token}'})
with urllib.request.urlopen(req) as resp:
    rep = json.loads(resp.read().decode())
    print("\n[OK] Phase 8 Performance Report:")
    print("  - 30-40-30 Composite Overall Score:", rep['scores']['overall_score'], "/ 10 (", rep['scores']['overall_percentage'], "%)")
    print("  - Speech Fluency (30%):", rep['scores']['speech_score'])
    print("  - Answer Quality (40%):", rep['scores']['answer_quality_score'])
    print("  - Body Language (30%):", rep['scores']['body_language_score'])
    print("  - Standing Verdict:", rep['scores']['verdict'])

print("\nFull Pipeline Verified Successfully!")
