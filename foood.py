import mysql.connector
from datetime import date

# -------------------------------
# DATABASE CONNECTION
# -------------------------------
try:
    db = mysql.connector.connect(
        host="localhost",
        user="root",
        password="Food1234",        
        database="food_delivery"
    )
    cursor = db.cursor()
except mysql.connector.Error as err:
    print(f"❌ Connection Error: {err}")
    exit()

print("\n----------------------------------------")
print("      ONLINE FOOD DELIVERY SYSTEM")
print("----------------------------------------")

# -------------------------------
# USER REGISTRATION
# -------------------------------
customer_name = input("\nEnter customer name: ")
cursor.execute("INSERT INTO User (name) VALUES (%s)", (customer_name,))
db.commit()
user_id = cursor.lastrowid

def show_menu():
    print("\n----------------------------------------")
    print("             TODAY'S MENU")
    print("----------------------------------------")
    cursor.execute("SELECT item_id, item_name, price FROM Menu")
    menu_items = cursor.fetchall()
    for item in menu_items:
        print(f"ID: {item[0]} | {item[1]:<20} | ₹{item[2]}")
    print("----------------------------------------")

def place_order():
    show_menu()
    
    print("\nEnter Item IDs (separated by commas, e.g., 1,2,5)")
    raw_ids = input("Selection: ")
    
    try:
        selected_ids = [id.strip() for id in raw_ids.split(',')]
        grand_total = 0
        order_summary = []

        for item_id in selected_ids:
            cursor.execute("SELECT item_name, price FROM Menu WHERE item_id = %s", (item_id,))
            result = cursor.fetchone()

            if result:
                item_name, price = result
                qty = int(input(f"Enter quantity for {item_name}: "))
                item_total = price * qty
                grand_total += item_total
                
                # Insert order into DB
                cursor.execute(
                    "INSERT INTO Orders (user_id, item_id, quantity, total_price, order_date) VALUES (%s, %s, %s, %s, %s)",
                    (user_id, item_id, qty, item_total, date.today())
                )
                order_summary.append(f"{item_name:<18} x{qty:<3} ₹{item_total}")
            else:
                print(f"⚠️ ID {item_id} not found. Skipping...")

        db.commit()

        if order_summary:
            # Updated Bill Section with Normal Lines and Name
            print("\n----------------------------------------")
            print("             FINAL INVOICE")
            print("----------------------------------------")
            print(f" CUSTOMER: {customer_name.upper()}")
            print(f" DATE    : {date.today()}")
            print("----------------------------------------")
            for line in order_summary:
                print(f" ✅ {line}")
            print("----------------------------------------")
            print(f" GRAND TOTAL:          ₹{grand_total}")
            print("----------------------------------------")
            print("   Thank you for ordering with us!")
            print("----------------------------------------")
        else:
            print("\n❌ No valid items were selected.")
            
    except ValueError:
        print("❌ Error: Please enter numbers only for IDs and quantities.")

# -------------------------------
# MAIN LOOP
# -------------------------------
while True:
    print("\n1. Place New Order")
    print("2. Exit")
    choice = input("Select option: ")

    if choice == '1':
        place_order()
    elif choice == '2':
        print("\nThankYou for choosing FOODY. Have a great day!")
        break
    else:
        print("❌ Invalid input!")

db.close()