from flask import Flask
from flask_cors import CORS
from mongoengine import connect
from src.controllers.userController import userController
from src.controllers.preGameController import preGameController
from src.controllers.inGameController import inGameController
from src.controllers.socketIoController import socketio
from src.controllers.extrasController import extrasController
from dotenv import load_dotenv
import os

app = Flask(__name__)
CORS(app, resources=r'/*')
load_dotenv()
response = connect(
db=os.getenv("db_database"),
host=os.getenv("db_host"),
username=os.getenv("db_user"),
password=os.getenv("db_pass")
)

socketio.init_app(app)

user = userController()
pre_game = preGameController()
in_game = inGameController()
extras = extrasController()
app.register_blueprint(user.blueprint, url_prefix='/user')
app.register_blueprint(pre_game.blueprint, url_prefix='/pre_game')
app.register_blueprint(in_game.blueprint, url_prefix='/in_game')
app.register_blueprint(extras.blueprint, url_prefix='/extras')
@app.route('/')
def Ok():
    return 'OK'

if __name__ == '__main__':  
    socketio.run(app, host="0.0.0.0", port=4000)
