from typing import Optional
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.models.action_item import ActionItem
from backend.app.schemas.all_schemas import ActionItemUpdate


def get_action_item_by_id(db: Session, action_item_id: int) -> Optional[ActionItem]:
    """Retrieve a single action item by ID."""
    return db.scalars(select(ActionItem).where(ActionItem.id == action_item_id)).first()


def update_action_item(
    db: Session,
    db_action_item: ActionItem,
    action_item_in: ActionItemUpdate,
) -> ActionItem:
    """Update action item fields (such as is_completed, assignee, task, etc.)."""
    update_data = action_item_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_action_item, field, value)

    db.add(db_action_item)
    db.commit()
    db.refresh(db_action_item)
    return db_action_item
