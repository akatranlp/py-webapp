from setuptools import setup

setup(
    name='py_api',
    version='0.1.0',
    author="Fabian Petersen",
    author_email="fabian@nf-petersen.de",
    install_requires=[
        "fastapi",
        "uvicorn[standard]",
        "tortoise-orm",
        "python-jose[cryptography]",
        "python-multipart",
        "passlib[argon2]",
        "python-dotenv",
        "pytest",
        "requests",
        "asynctest",
        "jinja2"
    ]
)
