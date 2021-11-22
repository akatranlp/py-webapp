import argparse
import sys
import string
import random
import dotenv


def program_parser():
    description = 'This program is used to generate a a random string to be a secret for the server'
    parser = argparse.ArgumentParser(prog='Random Secret Generator', description=description)
    parser.add_argument('--version', help='show program version', action='version', version='%(prog)s 0.1')
    parser.add_argument('-l', '--length', help='specify the length of the string', type=int, default=128)
    parser.add_argument('-s', '--set', help='specify the environment variable you want to set the string')
    parser.add_argument('-o', '--output', action="store_true",
                        help='use this if you want to see the string, use only if set the value')

    return parser


def get_random_string(length):
    letters = [
        *string.digits,
        *string.ascii_letters,
        *string.punctuation
    ]
    letters.remove('=')

    result_str = ''.join(random.choice(letters) for i in range(length))
    return result_str


def main():
    my_parser = program_parser()
    my_args = my_parser.parse_args()

    random_str = get_random_string(my_args.length)

    if not my_args.set or my_args.output:
        print(f'Random string of length {my_args.length} is: {random_str}')
        if not my_args.set:
            sys.exit(0)

    dotenv.set_key('.env', my_args.set, random_str)


if __name__ == '__main__':
    main()
