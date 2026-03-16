"""Initial schema

Revision ID: 001
Revises:
Create Date: 2026-02-22
"""
from alembic import op
import sqlalchemy as sa

revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('username', sa.String(64), unique=True, nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
    )

    op.create_table(
        'games',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('white_player_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('black_player_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('status', sa.String(32), nullable=True),
        sa.Column('winner', sa.String(8), nullable=True),
        sa.Column('board_state', sa.JSON(), nullable=True),
        sa.Column('turn', sa.String(8), nullable=True),
        sa.Column('halfmove_clock', sa.Integer(), nullable=True),
        sa.Column('fullmove_number', sa.Integer(), nullable=True),
        sa.Column('en_passant', sa.JSON(), nullable=True),
        sa.Column('white_kingside', sa.Boolean(), nullable=True),
        sa.Column('white_queenside', sa.Boolean(), nullable=True),
        sa.Column('black_kingside', sa.Boolean(), nullable=True),
        sa.Column('black_queenside', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
    )

    op.create_table(
        'moves',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('game_id', sa.Integer(), sa.ForeignKey('games.id'), nullable=False),
        sa.Column('move_number', sa.Integer(), nullable=False),
        sa.Column('algebraic', sa.String(16), nullable=False),
        sa.Column('from_row', sa.Integer(), nullable=False),
        sa.Column('from_col', sa.Integer(), nullable=False),
        sa.Column('to_row', sa.Integer(), nullable=False),
        sa.Column('to_col', sa.Integer(), nullable=False),
        sa.Column('promotion', sa.String(1), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
    )

    op.create_table(
        'board_states',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('game_id', sa.Integer(), sa.ForeignKey('games.id'), nullable=False),
        sa.Column('move_number', sa.Integer(), nullable=False),
        sa.Column('board_hash', sa.Integer(), nullable=True),
        sa.Column('state', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
    )


def downgrade():
    op.drop_table('board_states')
    op.drop_table('moves')
    op.drop_table('games')
    op.drop_table('users')
