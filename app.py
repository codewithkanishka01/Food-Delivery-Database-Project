from flask import Flask, jsonify, request, render_template
import mysql.connector
from datetime import date
import os

app = Flask(__name__)

# Database Configuration
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'Food1234',
    'database': 'food_delivery'
}

def get_db_connection():
    try:
        conn = mysql.connector.connect(**db_config)
        return conn
    except mysql.connector.Error as err:
        print(f"Connection Error: {err}")
        return None

# ----- FRONTEND ROUTES -----

@app.route('/')
def login():
    return render_template('login.html')

@app.route('/menu')
def menu():
    return render_template('menu.html')

@app.route('/cart')
def cart():
    return render_template('cart.html')


# ----- REST API ROUTES -----

@app.route('/api/menu', methods=['GET'])
def get_menu():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
        
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT Menu.item_id, Menu.item_name, Menu.price, Restaurant.rest_name
        FROM Menu
        JOIN Restaurant ON Menu.rest_id = Restaurant.rest_id
    """)
    menu_items = cursor.fetchall()
    
    # Image mapping logic
    image_map = {
        'Burger': 'burger_1773553684277.png',
        'Pizza': 'pizza_1773553698790.png',
        'Pasta': 'pasta_1773553714425.png',
        'Sandwich': 'sandwich_1773553728978.png',
        'French Fries': 'french_fries_1773553745012.png',
        'Paneer Tikka': 'paneer_tikka_1773553762234.png',
        'Veg Noodles': 'noodles_1773553777870.png',
        'Chicken Biryani': 'biryani_1773553793583.png',
        'Chocolate Brownie': 'brownie_1773553812434.png',
        'Vanilla Ice Cream': 'ice_cream_1773553827842.png',
        'Gulab Jamun': 'gulab_jamun_1773553846953.png',
        'Cheesecake': 'cheesecake_1773553864054.png'
    }
    
    for item in menu_items:
        item['image'] = image_map.get(item['item_name'], 'food_hero_1773553883576.png')
    
    cursor.close()
    conn.close()
    
    return jsonify(menu_items)

@app.route('/api/order', methods=['POST'])
def place_order():
    data = request.json
    customer_name = data.get('customerName')
    items = data.get('items', []) # format: [{'id': 1, 'qty': 2}]
    
    if not customer_name or not items:
         return jsonify({"error": "Missing customer name or items"}), 400
         
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
        
    cursor = conn.cursor()
    
    try:
        # 1. Register User
        cursor.execute("INSERT INTO User (name) VALUES (%s)", (customer_name,))
        user_id = cursor.lastrowid
        
        grand_total = 0
        order_details = []
        
        # 2. Insert Orders
        for item in items:
            item_id = item['id']
            qty = item['qty']
            
            # Get item price and name
            cursor.execute("SELECT item_name, price FROM Menu WHERE item_id = %s", (item_id,))
            result = cursor.fetchone()
            if result:
                item_name, price = result
                item_total = float(price) * qty
                grand_total += item_total
                
                cursor.execute(
                    "INSERT INTO Orders (user_id, item_id, quantity, total_price, order_date) VALUES (%s, %s, %s, %s, %s)",
                    (user_id, item_id, qty, item_total, date.today())
                )
                
                order_details.append({
                    "name": item_name,
                    "qty": qty,
                    "price": float(price),
                    "total": item_total
                })
        
        conn.commit()
        return jsonify({
            "message": "Order placed successfully!",
            "customer": customer_name,
            "order_summary": order_details,
            "grand_total": grand_total,
            "date": str(date.today())
        })
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    app.run(debug=True, port=5000)
