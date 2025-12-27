from app import create_app

app = create_app()

if __name__ == '__main__':
    app.run( host = '0.0.0.0' , port=5000)

@app.route("/")
def health():
    return {"status": "ok", "service": "NeuraAcademy API"}, 200
