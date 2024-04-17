import pandas as pd
import random
import uuid
import time
import bcrypt
from tqdm import tqdm, trange

if __name__ == '__main__':
    USER_CSV = './input/user.csv'
    PORTFOLIO_CSV = './input/portfolios.csv'
    POST_CSV = './input/post.csv'

    users = pd.read_csv(USER_CSV)
    portfolios = pd.read_csv(PORTFOLIO_CSV)
    post = pd.read_csv(POST_CSV)

    # Update the user id with uuid
    user_id_map = {}
    for i in range(users.shape[0]):
        user_id_map[users.loc[i, 'id']] = str(uuid.uuid4())
    portfolios['user_id'] = portfolios['user_id'].apply(lambda x: user_id_map[x])
    post['user_id'] = post['user_id'].apply(lambda x: user_id_map[x])
    # Convert join_time from mm-dd-yyyy to yyyy-mm-dd
    users['join_time'] = pd.to_datetime(users['join_time'], format='%m-%d-%Y').dt.strftime('%Y-%m-%d')
    users['id'] = users['id'].apply(lambda x: user_id_map[x])

    # User pass word hash with salt
    for i in trange(users.shape[0]):
        password = users.loc[i, 'password']
        join_time = random.randint(1523074708, 1586233108)
        users.loc[i, 'join_time'] = time.strftime('%Y-%m-%d', time.localtime(join_time))
        salt = bcrypt.gensalt()
        password = bcrypt.hashpw(password.encode(), salt)
        users.loc[i, 'password'] = password.decode()

    for i in trange(post.shape[0]):
        salt = random.randint(1, 2048)
        user_id = post.loc[i, 'user_id']
        # Random generate unix time from 1970 to 2024
        now_time = int(time.mktime(time.strptime('2024-01-01', '%Y-%m-%d')))
        create_time = random.randint(1586233108, now_time)
        length = now_time - create_time
        create_time_format = time.strftime('%Y-%m-%d', time.localtime(create_time))
        update_time = create_time + random.randint(0, length)
        update_time_format = time.strftime('%Y-%m-%d', time.localtime(update_time))

        post.loc[i, 'create_time'] = create_time_format
        post.loc[i, 'update_time'] = update_time_format
        
        title = post.loc[i, 'title']
        post.loc[i, 'id'] = str(uuid.uuid4())
    

    post_col = ['id', 'title', 'thumbs_up_num', 'description', 'content', 'user_id', 'create_time', 'update_time']
    post = post[post_col]

    user = ['id', 'name', 'password', 'email', 'join_time', 'balance', 'burger_coin']
    users = users[user]

    portfolios.to_csv(PORTFOLIO_CSV.replace('input', 'output'), index=False)
    post.to_csv(POST_CSV.replace('input', 'output'), index=False)
    users.to_csv(USER_CSV.replace('input', 'output'), index=False)