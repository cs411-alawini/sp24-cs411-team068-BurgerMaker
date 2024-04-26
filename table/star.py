import pymysql.cursors
import random

# Function to connect to the MySQL database
def connect_to_db():
    return pymysql.connect(host='35.192.43.40',
                           user='root',
                           password='',
                           database='dev',
                           cursorclass=pymysql.cursors.DictCursor)

# Fetch users and posts to generate star records
def fetch_ids():
    connection = connect_to_db()
    try:
        with connection.cursor() as cursor:
            # Fetch user IDs
            cursor.execute("SELECT id FROM User")
            users = [row['id'] for row in cursor.fetchall()]
            
            # Fetch post IDs
            cursor.execute("SELECT id FROM Post")
            posts = [row['id'] for row in cursor.fetchall()]
            
            return users, posts
    finally:
        connection.close()

# Generate and insert star records into the database
def generate_star_records(users, posts):
    connection = connect_to_db()
    try:
        with connection.cursor() as cursor:
            total_posts = len(posts)
            max_users_per_post = max(1, len(users) // 10)  # At least 1 user, or 10% of total users

            for index, post_id in enumerate(posts):
                # Decide randomly which users have starred this post, up to 10%
                starred_users = random.sample(users, random.randint(0, max_users_per_post))

                for user_id in starred_users:
                    star = random.choice([True, False])  # Randomly assign True or False

                    try:
                        # Insert record into StarPostRecord
                        cursor.execute("""
                            INSERT INTO StarPostRecord (user_id, post_id, star)
                            VALUES (%s, %s, %s) ON DUPLICATE KEY UPDATE star=VALUES(star)
                        """, (user_id, post_id, star))
                    except pymysql.Error as e:
                        print(f"Failed to insert/update star record for user {user_id} and post {post_id}: {e}")
                
                # Print progress
                print(f"Processed {index + 1}/{total_posts} posts.")

            connection.commit()  # Commit changes
            print("Star records inserted/updated successfully.")
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        connection.close()

# Main execution flow
if __name__ == '__main__':
    users, posts = fetch_ids()
    generate_star_records(users, posts)
