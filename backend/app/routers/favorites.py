from fastapi import APIRouter, HTTPException, Path
from typing import List
from datetime import datetime
from bson import ObjectId

from app.models.schemas import (
    Favorite,
    FavoriteCreate,
    FavoriteUpdate,
    FavoriteResponse
)
from app.database.mongodb import get_database

router = APIRouter(prefix="/api/favorites", tags=["favorites"])


@router.get("", response_model=FavoriteResponse)
async def get_favorites():
    """
    Get all favorite parts.

    Returns favorites ordered by last_ordered (most recent first).
    """
    try:
        db = get_database()

        cursor = db.favorites.find().sort("last_ordered", -1)
        favorites = await cursor.to_list(length=None)

        favorite_items = [Favorite(**item) for item in favorites]
        total = len(favorite_items)

        return FavoriteResponse(
            favorites=favorite_items,
            total=total
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("", response_model=Favorite)
async def create_favorite(favorite: FavoriteCreate):
    """
    Add a new favorite part.

    If the part already exists (same search_query), returns existing favorite.
    """
    try:
        db = get_database()

        # Check if already exists
        existing = await db.favorites.find_one({"search_query": favorite.search_query})

        if existing:
            return Favorite(**existing)

        # Create new favorite
        new_favorite = Favorite(
            part_description=favorite.part_description,
            search_query=favorite.search_query,
            times_ordered=0,
            created_at=datetime.utcnow()
        )

        result = await db.favorites.insert_one(
            new_favorite.model_dump(by_alias=True, exclude={"id"})
        )

        new_favorite.id = result.inserted_id

        return new_favorite

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{favorite_id}", response_model=Favorite)
async def update_favorite(
    favorite_id: str = Path(...),
    update: FavoriteUpdate = None
):
    """
    Update a favorite (e.g., increment times_ordered, update preferred_vendor).
    """
    try:
        db = get_database()

        # Build update document
        update_data = {}
        if update.times_ordered is not None:
            update_data["times_ordered"] = update.times_ordered
        if update.last_ordered is not None:
            update_data["last_ordered"] = update.last_ordered
        if update.preferred_vendor is not None:
            update_data["preferred_vendor"] = update.preferred_vendor

        if not update_data:
            raise HTTPException(status_code=400, detail="No update data provided")

        # Update favorite
        result = await db.favorites.find_one_and_update(
            {"_id": ObjectId(favorite_id)},
            {"$set": update_data},
            return_document=True
        )

        if not result:
            raise HTTPException(status_code=404, detail="Favorite not found")

        return Favorite(**result)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{favorite_id}")
async def delete_favorite(favorite_id: str = Path(...)):
    """Delete a favorite part."""
    try:
        db = get_database()

        result = await db.favorites.delete_one({"_id": ObjectId(favorite_id)})

        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Favorite not found")

        return {"status": "success", "deleted_id": favorite_id}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{favorite_id}/increment-orders")
async def increment_order_count(favorite_id: str = Path(...)):
    """
    Increment times_ordered count for a favorite.

    Convenience endpoint for quick order tracking.
    """
    try:
        db = get_database()

        result = await db.favorites.find_one_and_update(
            {"_id": ObjectId(favorite_id)},
            {
                "$inc": {"times_ordered": 1},
                "$set": {"last_ordered": datetime.utcnow()}
            },
            return_document=True
        )

        if not result:
            raise HTTPException(status_code=404, detail="Favorite not found")

        return Favorite(**result)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
