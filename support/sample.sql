start transaction;
insert into
    CLIENT (ID, FirstName, LastName, Email, Phone, BillingMethod)
    values ('zqing', 'Ziqi', 'Qing', 'zqing@uwaterloo.ca','+15198884567', 'Cash');

insert into
    EVENT (Subject, Type, Client, Budget, NumGuests)
    values ('Phone Interview', 'Interview', 'zqing', 0, 1);

insert into
    EVENT (Subject, Type, Client, Budget, NumGuests)
    values ('Ziqi''s Birthday Party', 'Privite', 'zqing', 0, 2);

insert into
    VENUE (ID, Address, Capacity, Price)
    values ('QNC', 'Quantum-Nano Centre', 120, 0);

insert into
    VENUE (ID, Address, Capacity, Price)
    values ('MC', 'Mathematics and Computer', 90, 0);

insert into
    VENUE (ID, Address, Capacity, Price)
    values ('STC', 'Science Teaching Complex', 100, 0);



insert into
    ITEM (Name, Price)
    values ('ramen', 10),
    ('spaghetti', 5),
    ('hamburger', 15),
    ('ham', 10),

    ('Air Jordan', 10000),
    ('Sports shoes', 100),
    ('lamb', 999),
    ('Google Home', 1000),

    ('Bad Guy', 100),
    ('Numb', 150),
    ('Love Story', 300);

insert into
    MENUITEM (ItemId, Cuisine, Calories, Servings)
    values (1,'Japanese', 500, 3),
    (2,'Italian', 400, 2),
    (3,'American', 300, 1),
    (4,'American', 200, 1);

insert into
    DECORITEM (ItemId, Brand, Description)
    values (5,'Nike', ''),
    (6, 'Adidas', ''),
    (7, 'Apple', ''),
    (8, 'Google', '');

insert into
    MUSICOPTION (ItemId, Artist, Album, Genre, Length)
    values (9, 'Billie Eilish', 'WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?', 'pop', 220),
    (10, 'Linkin Park', 'Meteora', 'rock',  243),
    (11, 'Taylor Swift', 'Yelawolf', 'pop', 260);

commit;