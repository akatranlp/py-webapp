import sqlite3
from py_api import hashing


def main():
    admin_password_hash = hashing.hash_password('adminpassword')
    user_password_hash = hashing.hash_password('userpassword')
    with sqlite3.connect('files/db.sqlite3') as con:
        con.execute("INSERT INTO user(username, password_hash, is_admin, email)"
                    f"VALUES ('admin', '{admin_password_hash}', 1, 'admin@email.com'),"
                    f"('user', '{user_password_hash}', 0, 'user@email.com')")
        con.commit()
        con.execute("INSERT INTO eventparticipantstatus(id, status)"
                    "VALUES (1, 'Accepted'),"
                    "(2, 'Pending'),"
                    "(3, 'Declined')")
        con.commit()


if __name__ == '__main__':
    main()
