import random
import time
import uuid
import pandas as pd

# Base words for generating portfolio names
adjectives = ['Global', 'Prime', 'Alpha', 'Innovative', 'Strategic', 'Dynamic', 'Premier', 'Elite', 'Legacy', 'Venture', 'Quantum', 'Pioneer', 'NextGen', 'Infinity', 'Elite', 'Visionary', 'Peak', 'FirstChoice', 'Ultimate', 'Trust', 'Secure', 'Future', 'Bright', 'Brighter', 'Brightest', 'Shining', 'Shiny', 'Shine', 'Glow', 'Glowing', 'Glowed', 'Glowy']
nouns = ['Capital', 'Investments', 'Wealth', 'Holdings', 'Assets', 'Management', 'Trust', 'Equity', 'Fund', 'Ventures', 'Finance', 'Advisors', 'Consulting', 'Solutions', 'Strategies', 'Group', 'Partners', 'Securities', 'Portfolios', 'Resources', 'Futures', 'Innovations', 'Insights', 'Opportunities', 'Growth', 'Development', 'Solutions', 'Services', 'Partnerships', 'Alliance', 'Network', 'Synergy', 'Collaboration', 'Partnership', 'Cooperation', 'Union', 'Association', 'Coalition', 'Federation', 'Confederation', 'Alliance', 'League', 'Society', 'Guild', 'Order', 'Brotherhood', 'Sisterhood', 'Fraternity', 'Sorority', 'Club', 'Circle', 'Community', 'Fellowship', 'Cohort', 'Companions', 'Comrades', 'Associates', 'Allies', 'Friends', 'Colleagues', 'Peers', 'Partners', 'Collaborators', 'Confederates', 'Co-conspirators', 'Accomplices']

# Function to generate portfolio names
def generate_portfolios(n):
    portfolios = []
    portfolio_names = set()  # Use a set to avoid duplicates
    while len(portfolios) < n:
        name = f"{random.choice(adjectives)} {random.choice(nouns)}"
        if random.random() < 0.1:
            name += f" {random.randint(1, 1000)}"
        if name in portfolio_names:
            continue
        portfolio_names.add(name)
        portfolio = {}
        portfolio['name'] = name
        color = f"#{random.getrandbits(24):06x}"
        portfolio['color'] = int(color[1:], 16)

        portfolio['id'] = str(uuid.uuid4())
        portfolio['is_pinned'] = random.choice([True, False]) 
        portfolio['user_id'] = random.randint(1, 500)

        portfolios.append(portfolio)

    return portfolios

if __name__ == "__main__":
    random.seed(time.time())
    portfolios = generate_portfolios(2000)
    df = pd.DataFrame(portfolios)
    cols = df.columns.tolist()
    cols = ['id', 'name', 'color', 'is_pinned', 'user_id']
    df = df[cols]

    df.to_csv('./input/portfolios.csv', index=False)




