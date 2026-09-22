import mysql.connector
from werkzeug.security import generate_password_hash
import os

# =========================
# MYSQL CONFIGURATION
# (dapat tumugma sa DB_CONFIG sa app.py)
# =========================

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", "3306")),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "gym_admin")
}

# =========================
# ADMIN ACCOUNT DETAILS
# (pwede mong palitan ito)
# =========================

USERNAME = "admin"
EMAIL = "admin@example.com"
PASSWORD = "admin123"


def create_admin():

    hashed_password = generate_password_hash(PASSWORD)

    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()

    try:

        cursor.execute(
            "SELECT id FROM admins WHERE username = %s",
            (USERNAME,)
        )

        existing = cursor.fetchone()

        if existing:

            cursor.execute(
                """
                UPDATE admins
                SET password_hash = %s,
                    failed_attempts = 0,
                    locked_until = NULL
                WHERE username = %s
                """,
                (hashed_password, USERNAME)
            )

            conn.commit()

            print(f"Admin '{USERNAME}' already existed. Na-reset ang password nito!")
            print(f"Username: {USERNAME}")
            print(f"Password: {PASSWORD}")

            return

        cursor.execute(
            """
            INSERT INTO admins
            (username, email, password_hash, failed_attempts, locked_until)
            VALUES (%s, %s, %s, 0, NULL)
            """,
            (USERNAME, EMAIL, hashed_password)
        )

        conn.commit()

        print(f"Successfully created admin account!")
        print(f"Username: {USERNAME}")
        print(f"Password: {PASSWORD}")

    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    create_admin()
