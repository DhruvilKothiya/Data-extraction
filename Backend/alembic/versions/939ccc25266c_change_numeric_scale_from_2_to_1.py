"""change numeric scale from 2 to 1

Revision ID: 939ccc25266c
Revises: 1f1fdd325b3b
Create Date: 2025-09-19 11:50:28.998896

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '939ccc25266c'
down_revision: Union[str, Sequence[str], None] = '1f1fdd325b3b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.alter_column("key_financial_data", "employer_contrib_latest_year",
        existing_type=sa.Numeric(20, 2),
        type_=sa.Numeric(20, 1),
        existing_nullable=True
    )
    op.alter_column("key_financial_data", "employer_contrib_previous_year",
        existing_type=sa.Numeric(20, 2),
        type_=sa.Numeric(20, 1),
        existing_nullable=True
    )
    op.alter_column("key_financial_data", "benefits_paid",
        existing_type=sa.Numeric(20, 2),
        type_=sa.Numeric(20, 1),
        existing_nullable=True
    )
    op.alter_column("key_financial_data", "expenses_paid_latest_year",
        existing_type=sa.Numeric(20, 2),
        type_=sa.Numeric(20, 1),
        existing_nullable=True
    )
    op.alter_column("key_financial_data", "expenses_paid_previous_year",
        existing_type=sa.Numeric(20, 2),
        type_=sa.Numeric(20, 1),
        existing_nullable=True
    )
    op.alter_column("key_financial_data", "defined_contrib_paid",
        existing_type=sa.Numeric(20, 2),
        type_=sa.Numeric(20, 1),
        existing_nullable=True
    )

    op.alter_column("key_financial_data", "assets_equities",
        existing_type=sa.Numeric(20, 2),
        type_=sa.Numeric(20, 1),
        existing_nullable=True
    )
    op.alter_column("key_financial_data", "assets_bonds",
        existing_type=sa.Numeric(20, 2),
        type_=sa.Numeric(20, 1),
        existing_nullable=True
    )
    op.alter_column("key_financial_data", "assets_real_estate",
        existing_type=sa.Numeric(20, 2),
        type_=sa.Numeric(20, 1),
        existing_nullable=True
    )
    op.alter_column("key_financial_data", "assets_ldi",
        existing_type=sa.Numeric(20, 2),
        type_=sa.Numeric(20, 1),
        existing_nullable=True
    )
    op.alter_column("key_financial_data", "assets_cash",
        existing_type=sa.Numeric(20, 2),
        type_=sa.Numeric(20, 1),
        existing_nullable=True
    )
    op.alter_column("key_financial_data", "assets_other",
        existing_type=sa.Numeric(20, 2),
        type_=sa.Numeric(20, 1),
        existing_nullable=True
    )
    op.alter_column("key_financial_data", "assets_diversified_growth",
        existing_type=sa.Numeric(20, 2),
        type_=sa.Numeric(20, 1),
        existing_nullable=True
    )
    op.alter_column("key_financial_data", "assets_alternatives",
        existing_type=sa.Numeric(20, 2),
        type_=sa.Numeric(20, 1),
        existing_nullable=True
    )
    op.alter_column("key_financial_data", "assets_insurance_contracts",
        existing_type=sa.Numeric(20, 2),
        type_=sa.Numeric(20, 1),
        existing_nullable=True
    )


def downgrade():
    op.alter_column("key_financial_data", "employer_contrib_latest_year",
        existing_type=sa.Numeric(20, 1),
        type_=sa.Numeric(20, 2),
        existing_nullable=True
    )
    op.alter_column("key_financial_data", "employer_contrib_previous_year",
        existing_type=sa.Numeric(20, 1),
        type_=sa.Numeric(20, 2),
        existing_nullable=True
    )
    op.alter_column("key_financial_data", "benefits_paid",
        existing_type=sa.Numeric(20, 1),
        type_=sa.Numeric(20, 2),
        existing_nullable=True
    )
    op.alter_column("key_financial_data", "expenses_paid_latest_year",
        existing_type=sa.Numeric(20, 1),
        type_=sa.Numeric(20, 2),
        existing_nullable=True
    )
    op.alter_column("key_financial_data", "expenses_paid_previous_year",
        existing_type=sa.Numeric(20, 1),
        type_=sa.Numeric(20, 2),
        existing_nullable=True
    )
    op.alter_column("key_financial_data", "defined_contrib_paid",
        existing_type=sa.Numeric(20, 1),
        type_=sa.Numeric(20, 2),
        existing_nullable=True
    )

    op.alter_column("key_financial_data", "assets_equities",
        existing_type=sa.Numeric(20, 1),
        type_=sa.Numeric(20, 2),
        existing_nullable=True
    )
    op.alter_column("key_financial_data", "assets_bonds",
        existing_type=sa.Numeric(20, 1),
        type_=sa.Numeric(20, 2),
        existing_nullable=True
    )
    op.alter_column("key_financial_data", "assets_real_estate",
        existing_type=sa.Numeric(20, 1),
        type_=sa.Numeric(20, 2),
        existing_nullable=True
    )
    op.alter_column("key_financial_data", "assets_ldi",
        existing_type=sa.Numeric(20, 1),
        type_=sa.Numeric(20, 2),
        existing_nullable=True
    )
    op.alter_column("key_financial_data", "assets_cash",
        existing_type=sa.Numeric(20, 1),
        type_=sa.Numeric(20, 2),
        existing_nullable=True
    )
    op.alter_column("key_financial_data", "assets_other",
        existing_type=sa.Numeric(20, 1),
        type_=sa.Numeric(20, 2),
        existing_nullable=True
    )
    op.alter_column("key_financial_data", "assets_diversified_growth",
        existing_type=sa.Numeric(20, 1),
        type_=sa.Numeric(20, 2),
        existing_nullable=True
    )
    op.alter_column("key_financial_data", "assets_alternatives",
        existing_type=sa.Numeric(20, 1),
        type_=sa.Numeric(20, 2),
        existing_nullable=True
    )
    op.alter_column("key_financial_data", "assets_insurance_contracts",
        existing_type=sa.Numeric(20, 1),
        type_=sa.Numeric(20, 2),
        existing_nullable=True
    )
