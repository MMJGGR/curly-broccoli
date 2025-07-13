import os
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from dotenv import load_dotenv

# load the repo‐root .env (not api/.env)
proj_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
load_dotenv(os.path.join(proj_root, '.env'))

from alembic import context
from app.database import Base  # your new Base from database.py

# this is the Alembic Config object
config = context.config
config.set_main_option("sqlalchemy.url", os.getenv("DATABASE_URL"))

# set up Python logging
fileConfig(config.config_file_name)

# tell Alembic what to autogenerate against
target_metadata = Base.metadata

def run_migrations_online():
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    # placeholder if you use offline mode
    pass
else:
    run_migrations_online()
