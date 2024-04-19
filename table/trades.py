import pymysql.cursors
import random
from datetime import datetime, timedelta
import uuid

# Connect to the database
connection = pymysql.connect(host='35.192.43.40',
                             user='root',
                             password='',
                             database='dev',
                             cursorclass=pymysql.cursors.DictCursor)

# Dictionary to keep track of net quantities for each portfolio and asset
net_quantities = {}

with connection:
    with connection.cursor() as cursor:
        # Fetch all portfolio IDs and their creation times
        sql = "SELECT id, create_time FROM Portfolio"
        cursor.execute(sql)
        portfolios = cursor.fetchall()

        # Fetch all asset IDs
        sql = "SELECT id FROM Asset"
        cursor.execute(sql)
        assets = [asset['id'] for asset in cursor.fetchall()]

    for portfolio in portfolios:
        portfolio_id = portfolio['id']
        # Convert string time to datetime object, assuming the format is '%Y-%m-%d %H:%M:%S'
        # create_time_dt = datetime.strptime(portfolio['create_time'], "%Y-%m-%d %H:%M:%S")
        create_time_dt = portfolio['create_time']
        latest_possible_date = create_time_dt
        current_time = datetime.now()

        # Generate 0-5 trades for each portfolio
        for _ in range(random.randint(0, 5)):
            # Ensure trade time is later than portfolio creation time but not later than current time 
            latest_possible_date = min(latest_possible_date + timedelta(days=random.randint(0, 3), hours=random.randint(0, 23)), current_time)
            trade_time = latest_possible_date

            # Randomly select an asset
            asset_id = random.choice(assets)

            # Initialize net quantity for each asset if not already present
            if (portfolio_id, asset_id) not in net_quantities:
                net_quantities[(portfolio_id, asset_id)] = 0

            # Decide on buy or sell based on current net quantity
            if net_quantities[(portfolio_id, asset_id)] > 0 and random.choice([True, False]):
                # Sell: choose quantity to be no more than what has been bought
                max_sell = net_quantities[(portfolio_id, asset_id)]
                quantity = -round(random.uniform(min(10, max_sell / 3), max_sell / 3), 8)
            else:
                # Buy: generate a random quantity
                quantity = round(random.uniform(1, 1000), 8)

            # Update net quantities dictionary
            net_quantities[(portfolio_id, asset_id)] += quantity

            # Generate a random price for the trade
            price = round(random.uniform(1, 1500), 8)

            with connection.cursor() as cursor:
                # Prepare the SQL query to insert the trade
                sql = "INSERT INTO `Trade` (`id`, `portfolio_id`, `asset_id`, `quantity`, `price`, `time`) VALUES (%s, %s, %s, %s, %s, %s)"

                # Execute the SQL query
                cursor.execute(sql, (str(uuid.uuid4()), portfolio_id, asset_id, quantity, price, trade_time.strftime("%Y-%m-%d %H:%M:%S")))

                # Commit to save changes
                connection.commit()

# Close the connection
connection.close()
