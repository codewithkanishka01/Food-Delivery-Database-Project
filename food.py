import mysql.connector

# Database se connect karne ka function
def connect_to_db():
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="Kannu@123", 
            database="FoodDeliveryDB"
        )
        return conn
    except Exception as e:
        print(f"Connection Error: {e}")
        return None

# Order report dikhane ka function
def show_orders():
    db = connect_to_db()
    if db:
        cursor = db.cursor()
        
        # JOIN query taaki IDs ki jagah real names dikhein
        query = """
        SELECT 
            o.order_no, u.customer_name, r.res_name, o.bill_amount, o.order_status
        FROM Orders o
        JOIN Users u ON o.user_id = u.id
        JOIN Restaurants r ON o.res_id = r.res_id;
        """
        
        cursor.execute(query)
        rows = cursor.fetchall()
        
        print("\n" + "="*60)
        print("          FOOD DELIVERY PROJECT - BACKEND REPORT")
        print("="*60)
        print(f"{'Order ID':<10} | {'Customer':<15} | {'Restaurant':<15} | {'Bill':<8}")
        print("-" * 60)
        
        for r in rows:
            print(f"{r[0]:<10} | {r[1]:<15} | {r[2]:<15} | ₹{r[3]:<8}")
            
        print("="*60)
        
        cursor.close()
        db.close()

if __name__ == "__main__":
    show_orders()