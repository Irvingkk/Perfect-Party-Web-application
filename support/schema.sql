start transaction;

create table ITEM (
    ID int AUTO_INCREMENT,
    Name varchar(128) not null,
    Price int,
    primary key (ID),
    check (Price >= 0)
);

create table MENUITEM (
    ItemId int,
    Cuisine varchar(64),
    Calories int,
    Servings int,
    primary key (ItemId),
    foreign key (ItemId)
        references ITEM (ID) on update cascade  on delete cascade,
    check (Calories >= 0),
    check (Servings >= 0)
);

create table DECORITEM (
    ItemId int,
    Brand varchar(64),
    Description varchar(4096),
    Image blob,
    primary key (ItemId),
    foreign key (ItemId)
        references ITEM (ID) on update cascade  on delete cascade
);

create table MUSICOPTION (
    ItemId int,
    Artist varchar(128),
    Album varchar(64),
    Genre varchar(64),
    Length int,
    primary key (ItemId),
    foreign key (ItemId)
        references ITEM (ID) on update cascade  on delete cascade,
    check (Length >= 0)
);

create table SUPPLIER (
    Name varchar(20) not null,
    ContactName varchar(128) not null,
    ContactPhone varchar(16) not null,
    primary key (Name)
);

create table PROVIDE (
    ItemId int,
    Supplier varchar(20),
    Cost int not null,
    primary key (ItemId , Supplier),
    foreign key (ItemId)
        references ITEM (ID) on update cascade  on delete cascade,
    foreign key (Supplier)
        references SUPPLIER (Name) on update cascade  on delete cascade
);

create table CLIENT (
    ID varchar(8),
    FirstName varchar(64) not null,
    LastName varchar(64) not null,
    Email varchar(320) not null,
    Phone varchar(16) not null,
    BillingMethod varchar(6) not null,
    primary key (ID)
);

create table VENUE (
    ID char(3),
    Address varchar(128),
    Capacity int not null,
    Price int not null,
    primary key (ID),
    check (Capacity >= 0),
    check (Price >= 0)
);

create table EVENT (
    ID int AUTO_INCREMENT,
    Subject varchar(512) not null,
    Type varchar(32) not null,
    Description varchar(4096),
    Budget int,
    NumGuests int,
    DesiredDate date,
    Client varchar(8) not null,
    Location char(8),
    Date date,
    primary key (ID),
    foreign key (Client)
        references CLIENT (ID) on update cascade  on delete cascade,
    foreign key (Location)
        references VENUE (ID) on update cascade  on delete set null,
    check (Budget >= 0),
    check (NumGuests >= 0)
);

create table USES (
    EventId int,
    ItemId int,
    Quantity int not null,
    primary key (ItemId , EventId),
    foreign key (ItemId)
        references ITEM (ID) on update cascade  on delete cascade,
    foreign key (EventId)
        references EVENT (ID) on update cascade  on delete cascade,
    check (Quantity >= 0)
);

commit;