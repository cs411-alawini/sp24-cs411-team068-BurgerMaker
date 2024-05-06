Constraints
Requirement: This requirement can be simply satisfied by defining the appropriate primary keys, and foreign keys. But we strongly encourage the team to use other types of constraints, such as attribute-level, tuple-level, and assertions. 

- In the User table, make sure that the email field is unique, as only one user should be registered per e-mail address:

ALTER TABLE User ADD CONSTRAINT unique_email UNIQUE (email);

- Set the default value of thumbs_up_num to 0 for Post, since new posts initially have 0 likes:

ALTER TABLE Post ALTER COLUMN thumbs_up_num SET DEFAULT 0;
