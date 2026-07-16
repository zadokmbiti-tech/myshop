from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_conn():
    return psycopg2.connect(os.getenv("DATABASE_URL"))


class ProductCreate(BaseModel):
    name: str
    description: str | None = None
    price: float
    sale_price: float | None = None
    category: str
    is_new: bool = False


class ProductImageCreate(BaseModel):
    blob_url: str
    is_primary: bool = False
    sort_order: int = 0


class ProductUpdate(BaseModel):
    name: str
    description: str | None = None
    price: float
    sale_price: float | None = None
    category: str
    is_new: bool = False


@app.get("/")
def read_root():
    return {"status": "running"}


@app.get("/products")
def get_products(category: str | None = None):
    conn = get_conn()
    cur = conn.cursor()
    if category:
        cur.execute(
            """
            SELECT id, name, price, sale_price, category, is_new
            FROM products WHERE category = %s ORDER BY created_at DESC;
            """,
            (category,),
        )
    else:
        cur.execute(
            "SELECT id, name, price, sale_price, category, is_new FROM products ORDER BY created_at DESC;"
        )
    rows = cur.fetchall()

    products = []
    for r in rows:
        product_id = r[0]
        cur.execute(
            "SELECT blob_url FROM product_images WHERE product_id = %s ORDER BY is_primary DESC, sort_order ASC LIMIT 1;",
            (product_id,),
        )
        img_row = cur.fetchone()
        products.append(
            {
                "id": r[0],
                "name": r[1],
                "price": float(r[2]),
                "sale_price": float(r[3]) if r[3] else None,
                "category": r[4],
                "is_new": r[5],
                "image_url": img_row[0] if img_row else None,
            }
        )

    cur.close()
    conn.close()
    return products


@app.get("/products/{product_id}")
def get_product(product_id: int):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, name, description, price, sale_price, category, is_new FROM products WHERE id = %s;",
        (product_id,),
    )
    row = cur.fetchone()
    if not row:
        cur.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Product not found")

    cur.execute(
        "SELECT blob_url FROM product_images WHERE product_id = %s ORDER BY is_primary DESC, sort_order ASC;",
        (product_id,),
    )
    images = [r[0] for r in cur.fetchall()]
    cur.close()
    conn.close()

    return {
        "id": row[0],
        "name": row[1],
        "description": row[2],
        "price": float(row[3]),
        "sale_price": float(row[4]) if row[4] else None,
        "category": row[5],
        "is_new": row[6],
        "images": images,
    }


@app.post("/admin/products")
def create_product(product: ProductCreate):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO products (name, description, price, sale_price, category, is_new)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING id;
        """,
        (product.name, product.description, product.price, product.sale_price, product.category, product.is_new),
    )
    new_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return {"id": new_id, "message": "Product created"}


@app.post("/admin/products/{product_id}/images")
def add_product_image(product_id: int, image: ProductImageCreate):
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("SELECT id FROM products WHERE id = %s;", (product_id,))
    if not cur.fetchone():
        cur.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Product not found")

    cur.execute(
        """
        INSERT INTO product_images (product_id, blob_url, is_primary, sort_order)
        VALUES (%s, %s, %s, %s)
        RETURNING id;
        """,
        (product_id, image.blob_url, image.is_primary, image.sort_order),
    )
    new_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return {"id": new_id, "message": "Image added"}


@app.put("/admin/products/{product_id}")
def update_product(product_id: int, product: ProductUpdate):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT id FROM products WHERE id = %s;", (product_id,))
    if not cur.fetchone():
        cur.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Product not found")

    cur.execute(
        """
        UPDATE products
        SET name = %s, description = %s, price = %s, sale_price = %s, category = %s, is_new = %s
        WHERE id = %s;
        """,
        (product.name, product.description, product.price, product.sale_price, product.category, product.is_new, product_id),
    )
    conn.commit()
    cur.close()
    conn.close()
    return {"message": "Product updated"}


@app.put("/admin/products/{product_id}/image")
def replace_product_image(product_id: int, image: ProductImageCreate):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT id FROM products WHERE id = %s;", (product_id,))
    if not cur.fetchone():
        cur.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Product not found")

    cur.execute("DELETE FROM product_images WHERE product_id = %s;", (product_id,))
    cur.execute(
        """
        INSERT INTO product_images (product_id, blob_url, is_primary, sort_order)
        VALUES (%s, %s, TRUE, 0)
        RETURNING id;
        """,
        (product_id, image.blob_url),
    )
    new_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return {"id": new_id, "message": "Image updated"}


@app.delete("/admin/products/{product_id}")
def delete_product(product_id: int):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("DELETE FROM products WHERE id = %s RETURNING id;", (product_id,))
    deleted = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    if not deleted:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted"}