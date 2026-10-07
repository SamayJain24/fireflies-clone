from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.crud.crud_action_item import get_action_item_by_id, update_action_item
from backend.app.schemas.all_schemas import ActionItemResponse, ActionItemUpdate

router = APIRouter(tags=["Action Items"])


@router.patch(
    "/action-items/{action_item_id}",
    response_model=ActionItemResponse,
    summary="Update action item completion status or details",
)
@router.patch(
    "/action_items/{action_item_id}",
    response_model=ActionItemResponse,
    include_in_schema=False,
)
def patch_action_item(
    action_item_id: int,
    action_item_in: ActionItemUpdate,
    db: Session = Depends(get_db),
) -> ActionItemResponse:
    """
    Update an existing action item by ID.
    Supports toggling `is_completed`, changing assignee, due date, etc.
    """
    item = get_action_item_by_id(db=db, action_item_id=action_item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Action item with ID {action_item_id} not found",
        )
    return update_action_item(db=db, db_action_item=item, action_item_in=action_item_in)
