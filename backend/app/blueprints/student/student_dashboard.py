from flask import Blueprint , jsonify , session

student_bp = Blueprint("student" , __name__ , url_prefix="/api/student")

@student_bp.route('/dashboard' , methods=['GET'])
def Dashboard():
    if "user_id" not in session or session.get('role') != "student":
        return jsonify({"message" : "Unauthorized"}) , 401
    
    data = {
        "active_courses": 3,
        "consistency": 86,
        "avg_score": 78,
        "global_rank": 24,
        "courses": [
            {"title": "DSA Bootcamp", "progress": 42},
            {"title": "Web Development", "progress": 68}
        ],
        "upcoming": [
            "DSA Mid Exam – Tomorrow",
            "Web Dev Assignment – 3 days left"
        ]
    }

    return jsonify(data)


