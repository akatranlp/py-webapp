import sqlite3
from py_api import hashing


def main():
    admin_password_hash = hashing.hash_password('adminpassword')
    user_password_hash = hashing.hash_password('userpassword')
    with sqlite3.connect('db.sqlite3') as con:
        con.execute("INSERT INTO user(username, password_hash, is_admin, email) "
                    f"VALUES ('admin', '{admin_password_hash}', 1, 'admin@email.com'),"
                    f"VALUES ('user', '{user_password_hash}', 'user@email.com')")
        con.commit()


if __name__ == '__main__':
    main()
