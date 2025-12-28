import requests
from pprint import pprint

BASE = "https://neuraacademy.onrender.com"
ORIGIN = "https://neuraacademy.vercel.app"

s = requests.Session()
headers = {"Origin": ORIGIN, "Content-Type": "application/json"}

print("=== LOGIN ===")
resp = s.post(f"{BASE}/api/auth/login/student",
              json={"email":"nishchup489@gmail.com","password":"12121212"},
              headers=headers,
              allow_redirects=False,
              timeout=30)
print("status:", resp.status_code)
pprint(dict(resp.headers))
print("body:", resp.text)
print("cookies after login:", s.cookies.get_dict())

print("\n=== PROFILE POST ===")
# multipart form
resp2 = s.post(f"{BASE}/api/student/profile",
               headers={"Origin": ORIGIN}, 
               data={"first_name":"Test","last_name":"User"},
               timeout=30)
print("status:", resp2.status_code)
pprint(dict(resp2.headers))
print("body:", resp2.text)
print("cookies now:", s.cookies.get_dict())