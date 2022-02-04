import argparse
import sys
from datetime import datetime
from jose import jwt
from py_api import config


def program_parser():
    description = 'This program is used to generate a jwt token for the devs with the specified secrets of the server'
    parser = argparse.ArgumentParser(prog='JWT-Token Generator', description=description)
    parser.add_argument('--version', help='show program version', action='version', version='%(prog)s 0.1')
    parser.add_argument('id', help='specify the user_id for the token', type=int)
    parser.add_argument('-s', '--secret', help='specify an other secret than the server')

    return parser


def create_jwt_token(user_id: int, secret: str):
    jwt_obj = {'id': user_id, 'nbf': datetime.utcnow()}
    return jwt.encode(jwt_obj, secret)


def main():
    my_parser = program_parser()
    my_args = my_parser.parse_args()

    jwt_secret = my_args.secret

    if jwt_secret is None:
        needed_keys = ['JWT_ACCESS_TOKEN_SECRET']
        if not config.Config.get_instance().validate_needed_keys(needed_keys):
            raise Exception('not all Keys are there')
        jwt_secret = config.Config.get_instance().get_config_value('JWT_ACCESS_TOKEN_SECRET')

    print(create_jwt_token(my_args.id, jwt_secret))
    sys.exit(0)


if __name__ == '__main__':
    main()
