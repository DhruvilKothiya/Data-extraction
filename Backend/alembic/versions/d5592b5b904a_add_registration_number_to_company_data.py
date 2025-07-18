"""Add registration_number to company_data

Revision ID: d5592b5b904a
Revises: 420f80b80ba4
Create Date: 2025-07-17 12:32:39.456226

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd5592b5b904a'
down_revision: Union[str, Sequence[str], None] = '420f80b80ba4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('company_data', sa.Column('registration_number', sa.String(length=100), nullable=True))
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('company_data', 'registration_number')
    # ### end Alembic commands ###
