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