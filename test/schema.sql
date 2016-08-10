--
-- PostgreSQL database dump
--

-- Dumped from database version 8.4.13
-- Dumped by pg_dump version 9.5.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = off;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET escape_string_warning = off;

DROP DATABASE IF EXISTS emptytest;
CREATE DATABASE emptytest WITH TEMPLATE = template0 ENCODING = 'UTF8';

DROP DATABASE IF EXISTS strongloop;
--
-- Name: strongloop; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE strongloop WITH TEMPLATE = template0 ENCODING = 'UTF8';


\connect strongloop

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = off;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET escape_string_warning = off;

--
-- Name: strongloop; Type: SCHEMA; Schema: -; Owner: strongloop
--

CREATE SCHEMA IF NOT EXISTS strongloop;


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: TestGeo; Type: TABLE; Schema: public; Owner: strongloop
--

CREATE TABLE "TestGeo" (
    loc point,
    id integer NOT NULL
);


--
-- Name: TestGeo_id_seq; Type: SEQUENCE; Schema: public; Owner: strongloop
--

CREATE SEQUENCE "TestGeo_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: TestGeo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: strongloop
--

ALTER SEQUENCE "TestGeo_id_seq" OWNED BY "TestGeo".id;


--
-- Name: account; Type: TABLE; Schema: public; Owner: strongloop
--

CREATE TABLE account (
    name text,
    emails text,
    age integer,
    id integer NOT NULL
);


--
-- Name: account_id_seq; Type: SEQUENCE; Schema: public; Owner: strongloop
--

CREATE SEQUENCE account_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: account_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: strongloop
--

ALTER SEQUENCE account_id_seq OWNED BY account.id;


--
-- Name: demo; Type: TABLE; Schema: public; Owner: strongloop
--

CREATE TABLE demo (
    name text NOT NULL,
    id integer NOT NULL
);


--
-- Name: demo_id_seq; Type: SEQUENCE; Schema: public; Owner: strongloop
--

CREATE SEQUENCE demo_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: demo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: strongloop
--

ALTER SEQUENCE demo_id_seq OWNED BY demo.id;


--
-- Name: park1; Type: TABLE; Schema: public; Owner: strongloop
--

CREATE TABLE park1 (
    id integer NOT NULL,
    kids4 character varying(1024),
    park4 character varying(1024),
    trees4 character varying(1024)
);


--
-- Name: park1_id_seq; Type: SEQUENCE; Schema: public; Owner: strongloop
--

CREATE SEQUENCE park1_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: park1_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: strongloop
--

ALTER SEQUENCE park1_id_seq OWNED BY park1.id;


--
-- Name: population; Type: TABLE; Schema: public; Owner: strongloop
--

CREATE TABLE population (
    count integer NOT NULL,
    id integer NOT NULL
);


--
-- Name: population_id_seq; Type: SEQUENCE; Schema: public; Owner: strongloop
--

CREATE SEQUENCE population_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: population_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: strongloop
--

ALTER SEQUENCE population_id_seq OWNED BY population.id;


--
-- Name: postgres; Type: TABLE; Schema: public; Owner: strongloop
--

CREATE TABLE postgres (
    name character varying(1024),
    count integer,
    id integer NOT NULL
);


--
-- Name: postgres_id_seq; Type: SEQUENCE; Schema: public; Owner: strongloop
--

CREATE SEQUENCE postgres_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: postgres_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: strongloop
--

ALTER SEQUENCE postgres_id_seq OWNED BY postgres.id;


--
-- Name: testmodel-postgresql; Type: TABLE; Schema: public; Owner: strongloop
--

CREATE TABLE "testmodel-postgresql" (
    foo integer NOT NULL,
    id integer NOT NULL
);


--
-- Name: testmodel-postgresql_id_seq; Type: SEQUENCE; Schema: public; Owner: strongloop
--

CREATE SEQUENCE "testmodel-postgresql_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: testmodel-postgresql_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: strongloop
--

ALTER SEQUENCE "testmodel-postgresql_id_seq" OWNED BY "testmodel-postgresql".id;


SET search_path = strongloop, pg_catalog;

--
-- Name: GeoPoint; Type: TABLE; Schema: strongloop; Owner: strongloop
--

CREATE TABLE "GeoPoint" (
    id integer NOT NULL,
    location point
);


--
-- Name: GeoPoint_id_seq; Type: SEQUENCE; Schema: strongloop; Owner: strongloop
--

CREATE SEQUENCE "GeoPoint_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: GeoPoint_id_seq; Type: SEQUENCE OWNED BY; Schema: strongloop; Owner: strongloop
--

ALTER SEQUENCE "GeoPoint_id_seq" OWNED BY "GeoPoint".id;


--
-- Name: customer; Type: TABLE; Schema: strongloop; Owner: strongloop
--

CREATE TABLE customer (
    id character varying(64) NOT NULL,
    username character varying(1024),
    email character varying(1024),
    password character varying(1024),
    name character varying(40),
    military_agency character varying(20),
    realm character varying(1024),
    emailverified character(1),
    verificationtoken character varying(1024),
    credentials character varying(1024),
    challenges character varying(1024),
    status character varying(1024),
    created date,
    lastupdated date
);


--
-- Name: inventory; Type: TABLE; Schema: strongloop; Owner: strongloop
--

CREATE TABLE inventory (
    id character varying(64) NOT NULL,
    product_id character varying(20),
    location_id character varying(20),
    available integer,
    total integer
);


--
-- Name: location; Type: TABLE; Schema: strongloop; Owner: strongloop
--

CREATE TABLE location (
    id character varying(64) NOT NULL,
    street character varying(64),
    city character varying(64),
    zipcode character varying(16),
    name character varying(32),
    geo point
);


--
-- Name: product; Type: TABLE; Schema: strongloop; Owner: strongloop
--

CREATE TABLE product (
    id character varying(64) NOT NULL,
    name character varying(64),
    audible_range integer,
    effective_range integer,
    rounds integer,
    extras character varying(64),
    fire_modes character varying(64)
);


--
-- Name: inventory_view; Type: VIEW; Schema: strongloop; Owner: strongloop
--

CREATE VIEW inventory_view AS
SELECT p.name AS product, l.name AS location, i.available FROM inventory i, product p, location l WHERE (((p.id)::text = (i.product_id)::text) AND ((l.id)::text = (i.location_id)::text));


--
-- Name: reservation; Type: TABLE; Schema: strongloop; Owner: strongloop
--

CREATE TABLE reservation (
    id character varying(64),
    product_id character varying(20),
    location_id character varying(20),
    customer_id character varying(20),
    qty integer,
    status character varying(20),
    reserve_date date,
    pickup_date date,
    return_date date
);


--
-- Name: session; Type: TABLE; Schema: strongloop; Owner: strongloop
--

CREATE TABLE session (
    id character varying(64) NOT NULL,
    uid character varying(1024),
    ttl integer
);


SET search_path = public, pg_catalog;

--
-- Name: id; Type: DEFAULT; Schema: public; Owner: strongloop
--

ALTER TABLE ONLY "TestGeo" ALTER COLUMN id SET DEFAULT nextval('"TestGeo_id_seq"'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: strongloop
--

ALTER TABLE ONLY account ALTER COLUMN id SET DEFAULT nextval('account_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: strongloop
--

ALTER TABLE ONLY demo ALTER COLUMN id SET DEFAULT nextval('demo_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: strongloop
--

ALTER TABLE ONLY park1 ALTER COLUMN id SET DEFAULT nextval('park1_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: strongloop
--

ALTER TABLE ONLY population ALTER COLUMN id SET DEFAULT nextval('population_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: strongloop
--

ALTER TABLE ONLY postgres ALTER COLUMN id SET DEFAULT nextval('postgres_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: strongloop
--

ALTER TABLE ONLY "testmodel-postgresql" ALTER COLUMN id SET DEFAULT nextval('"testmodel-postgresql_id_seq"'::regclass);


SET search_path = strongloop, pg_catalog;

--
-- Name: id; Type: DEFAULT; Schema: strongloop; Owner: strongloop
--

ALTER TABLE ONLY "GeoPoint" ALTER COLUMN id SET DEFAULT nextval('"GeoPoint_id_seq"'::regclass);


SET search_path = public, pg_catalog;

--
-- Data for Name: TestGeo; Type: TABLE DATA; Schema: public; Owner: strongloop
--

INSERT INTO "TestGeo" VALUES ('(1,2)', 1);


--
-- Name: TestGeo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: strongloop
--

SELECT pg_catalog.setval('"TestGeo_id_seq"', 1, true);


--
-- Data for Name: account; Type: TABLE DATA; Schema: public; Owner: strongloop
--

INSERT INTO account VALUES ('John1', '["john@x.com","jhon@y.com"]', 30, 1);
INSERT INTO account VALUES ('John2', '["john@x.com","jhon@y.com"]', 30, 2);


--
-- Name: account_id_seq; Type: SEQUENCE SET; Schema: public; Owner: strongloop
--

SELECT pg_catalog.setval('account_id_seq', 2, true);


--
-- Data for Name: demo; Type: TABLE DATA; Schema: public; Owner: strongloop
--

INSERT INTO demo VALUES ('first', 1);
INSERT INTO demo VALUES ('first', 0);


--
-- Name: demo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: strongloop
--

SELECT pg_catalog.setval('demo_id_seq', 1, true);


--
-- Data for Name: park1; Type: TABLE DATA; Schema: public; Owner: strongloop
--



--
-- Name: park1_id_seq; Type: SEQUENCE SET; Schema: public; Owner: strongloop
--

SELECT pg_catalog.setval('park1_id_seq', 1, false);


--
-- Data for Name: population; Type: TABLE DATA; Schema: public; Owner: strongloop
--

INSERT INTO population VALUES (1, 1);


--
-- Name: population_id_seq; Type: SEQUENCE SET; Schema: public; Owner: strongloop
--

SELECT pg_catalog.setval('population_id_seq', 1, true);


--
-- Data for Name: postgres; Type: TABLE DATA; Schema: public; Owner: strongloop
--

INSERT INTO postgres VALUES ('excepturi illum aliquid', 17634221, 8258338);
INSERT INTO postgres VALUES (NULL, NULL, 1);
INSERT INTO postgres VALUES (NULL, NULL, 2);
INSERT INTO postgres VALUES ('quidem quae omnis placeat fugiat', -91510489, 69337814);
INSERT INTO postgres VALUES (NULL, -44641440, 65609423);
INSERT INTO postgres VALUES ('ut repellendus saepe voluptates consequuntur', NULL, 321321);
INSERT INTO postgres VALUES ('reiciendis velit corporis harum deserunt', 42724312, -45351866);
INSERT INTO postgres VALUES ('sapiente', NULL, -87577258);


--
-- Name: postgres_id_seq; Type: SEQUENCE SET; Schema: public; Owner: strongloop
--

SELECT pg_catalog.setval('postgres_id_seq', 2, true);


--
-- Data for Name: testmodel-postgresql; Type: TABLE DATA; Schema: public; Owner: strongloop
--



--
-- Name: testmodel-postgresql_id_seq; Type: SEQUENCE SET; Schema: public; Owner: strongloop
--

SELECT pg_catalog.setval('"testmodel-postgresql_id_seq"', 1, false);


SET search_path = strongloop, pg_catalog;

--
-- Data for Name: GeoPoint; Type: TABLE DATA; Schema: strongloop; Owner: strongloop
--

INSERT INTO "GeoPoint" VALUES (1, '(10,20)');
INSERT INTO "GeoPoint" VALUES (2, '(-120,90)');


--
-- Name: GeoPoint_id_seq; Type: SEQUENCE SET; Schema: strongloop; Owner: strongloop
--

SELECT pg_catalog.setval('"GeoPoint_id_seq"', 2, true);


--
-- Data for Name: customer; Type: TABLE DATA; Schema: strongloop; Owner: strongloop
--

INSERT INTO customer VALUES ('612', 'bat', 'bat@bar.com', '$2a$10$BEG18wcYQn7TRkFIc59EB.vmnsEwqJWMlYM4DNG73iZb.MKA1rjAC', NULL, NULL, NULL, NULL, NULL, '[]', '[]', NULL, NULL, NULL);
INSERT INTO customer VALUES ('613', 'baz', 'baz@bar.com', '$2a$10$jkSYF2gLMdI4CwVQh8AStOs0b24lDu9p8jccnmri/0rvhtwsicm9C', NULL, NULL, NULL, NULL, NULL, '[]', '[]', NULL, NULL, NULL);
INSERT INTO customer VALUES ('610', 'foo', 'foo@bar.com', '$2a$10$tn1hN7Xv6x74cCB7tVfwkeaaJTd4/6q4RbCMzgmAJeWe40xqrRSui', NULL, NULL, NULL, NULL, NULL, '[]', '[]', NULL, NULL, NULL);
INSERT INTO customer VALUES ('611', 'bar', 'bar@bar.com', '$2a$10$a8mCol6d5vQXm6vubqXl8e5V66StEg6E8vzjQqPpoyk95Vm3smpiK', NULL, NULL, NULL, NULL, NULL, '[]', '[]', NULL, NULL, NULL);


--
-- Data for Name: inventory; Type: TABLE DATA; Schema: strongloop; Owner: strongloop
--

INSERT INTO inventory VALUES ('441', '6', '91', 8, 19);
INSERT INTO inventory VALUES ('442', '7', '91', 21, 23);
INSERT INTO inventory VALUES ('443', '8', '91', 35, 63);
INSERT INTO inventory VALUES ('444', '9', '91', 0, 7);
INSERT INTO inventory VALUES ('445', '10', '91', 0, 2);
INSERT INTO inventory VALUES ('446', '11', '91', 1, 6);
INSERT INTO inventory VALUES ('447', '12', '91', 67, 77);
INSERT INTO inventory VALUES ('448', '13', '91', 7, 51);
INSERT INTO inventory VALUES ('449', '14', '91', 39, 96);
INSERT INTO inventory VALUES ('450', '15', '91', 36, 74);
INSERT INTO inventory VALUES ('451', '16', '91', 15, 73);
INSERT INTO inventory VALUES ('453', '18', '91', 0, 19);
INSERT INTO inventory VALUES ('452', '17', '91', 36, 63);
INSERT INTO inventory VALUES ('454', '19', '91', 24, 94);
INSERT INTO inventory VALUES ('455', '20', '91', 8, 38);
INSERT INTO inventory VALUES ('456', '21', '91', 41, 58);
INSERT INTO inventory VALUES ('457', '22', '91', 18, 22);
INSERT INTO inventory VALUES ('458', '23', '91', 25, 37);
INSERT INTO inventory VALUES ('459', '24', '91', 39, 60);
INSERT INTO inventory VALUES ('460', '25', '91', 30, 55);
INSERT INTO inventory VALUES ('461', '26', '91', 4, 4);
INSERT INTO inventory VALUES ('462', '27', '91', 6, 17);
INSERT INTO inventory VALUES ('463', '28', '91', 63, 82);
INSERT INTO inventory VALUES ('464', '29', '91', 30, 76);
INSERT INTO inventory VALUES ('465', '30', '91', 13, 31);
INSERT INTO inventory VALUES ('466', '31', '91', 10, 59);
INSERT INTO inventory VALUES ('467', '32', '91', 39, 80);
INSERT INTO inventory VALUES ('468', '33', '91', 69, 89);
INSERT INTO inventory VALUES ('469', '34', '91', 62, 93);
INSERT INTO inventory VALUES ('470', '35', '91', 13, 27);
INSERT INTO inventory VALUES ('471', '36', '91', 8, 22);
INSERT INTO inventory VALUES ('472', '37', '91', 0, 31);
INSERT INTO inventory VALUES ('473', '38', '91', 9, 79);
INSERT INTO inventory VALUES ('474', '39', '91', 6, 49);
INSERT INTO inventory VALUES ('475', '40', '91', 39, 40);
INSERT INTO inventory VALUES ('476', '41', '91', 1, 22);
INSERT INTO inventory VALUES ('477', '42', '91', 12, 82);
INSERT INTO inventory VALUES ('478', '43', '91', 1, 7);
INSERT INTO inventory VALUES ('479', '44', '91', 15, 26);
INSERT INTO inventory VALUES ('480', '45', '91', 22, 31);
INSERT INTO inventory VALUES ('481', '46', '91', 64, 65);
INSERT INTO inventory VALUES ('482', '47', '91', 10, 99);
INSERT INTO inventory VALUES ('483', '48', '91', 26, 56);
INSERT INTO inventory VALUES ('484', '49', '91', 14, 19);
INSERT INTO inventory VALUES ('485', '50', '91', 51, 55);
INSERT INTO inventory VALUES ('486', '51', '91', 25, 29);
INSERT INTO inventory VALUES ('487', '52', '91', 31, 37);
INSERT INTO inventory VALUES ('488', '53', '91', 35, 71);
INSERT INTO inventory VALUES ('489', '54', '91', 5, 61);
INSERT INTO inventory VALUES ('490', '55', '91', 4, 26);
INSERT INTO inventory VALUES ('491', '56', '91', 29, 50);
INSERT INTO inventory VALUES ('492', '57', '91', 15, 34);
INSERT INTO inventory VALUES ('493', '58', '91', 30, 38);
INSERT INTO inventory VALUES ('494', '59', '91', 54, 71);
INSERT INTO inventory VALUES ('495', '60', '91', 6, 43);
INSERT INTO inventory VALUES ('496', '61', '91', 40, 80);
INSERT INTO inventory VALUES ('497', '62', '91', 32, 33);
INSERT INTO inventory VALUES ('498', '63', '91', 44, 53);
INSERT INTO inventory VALUES ('499', '64', '91', 10, 68);
INSERT INTO inventory VALUES ('500', '65', '91', 11, 13);
INSERT INTO inventory VALUES ('501', '66', '91', 7, 40);
INSERT INTO inventory VALUES ('502', '67', '91', 5, 20);
INSERT INTO inventory VALUES ('503', '68', '91', 30, 40);
INSERT INTO inventory VALUES ('504', '69', '91', 6, 48);
INSERT INTO inventory VALUES ('505', '70', '91', 7, 53);
INSERT INTO inventory VALUES ('506', '71', '91', 2, 21);
INSERT INTO inventory VALUES ('507', '72', '91', 25, 56);
INSERT INTO inventory VALUES ('508', '73', '91', 13, 85);
INSERT INTO inventory VALUES ('509', '74', '91', 63, 67);
INSERT INTO inventory VALUES ('510', '75', '91', 9, 11);
INSERT INTO inventory VALUES ('511', '76', '91', 18, 46);
INSERT INTO inventory VALUES ('512', '77', '91', 7, 88);
INSERT INTO inventory VALUES ('513', '78', '91', 36, 55);
INSERT INTO inventory VALUES ('514', '79', '91', 8, 33);
INSERT INTO inventory VALUES ('515', '80', '91', 63, 73);
INSERT INTO inventory VALUES ('517', '82', '91', 2, 5);
INSERT INTO inventory VALUES ('516', '81', '91', 36, 71);
INSERT INTO inventory VALUES ('518', '83', '91', 11, 11);
INSERT INTO inventory VALUES ('519', '84', '91', 21, 39);
INSERT INTO inventory VALUES ('520', '85', '91', 90, 91);
INSERT INTO inventory VALUES ('521', '86', '91', 1, 2);
INSERT INTO inventory VALUES ('522', '87', '91', 36, 47);
INSERT INTO inventory VALUES ('523', '2', '92', 6, 7);
INSERT INTO inventory VALUES ('524', '3', '92', 15, 23);
INSERT INTO inventory VALUES ('525', '4', '92', 1, 1);
INSERT INTO inventory VALUES ('527', '6', '92', 22, 24);
INSERT INTO inventory VALUES ('526', '5', '92', 37, 42);
INSERT INTO inventory VALUES ('528', '7', '92', 12, 13);
INSERT INTO inventory VALUES ('529', '8', '92', 4, 25);
INSERT INTO inventory VALUES ('531', '10', '92', 9, 31);
INSERT INTO inventory VALUES ('530', '9', '92', 32, 87);
INSERT INTO inventory VALUES ('532', '11', '92', 2, 38);
INSERT INTO inventory VALUES ('533', '12', '92', 66, 88);
INSERT INTO inventory VALUES ('534', '13', '92', 4, 15);
INSERT INTO inventory VALUES ('535', '14', '92', 9, 88);
INSERT INTO inventory VALUES ('536', '15', '92', 18, 72);
INSERT INTO inventory VALUES ('537', '16', '92', 13, 26);
INSERT INTO inventory VALUES ('538', '17', '92', 20, 55);
INSERT INTO inventory VALUES ('539', '18', '92', 17, 76);
INSERT INTO inventory VALUES ('540', '19', '92', 28, 58);
INSERT INTO inventory VALUES ('542', '21', '92', 7, 12);
INSERT INTO inventory VALUES ('541', '20', '92', 78, 99);
INSERT INTO inventory VALUES ('543', '22', '92', 4, 13);
INSERT INTO inventory VALUES ('544', '23', '92', 12, 96);
INSERT INTO inventory VALUES ('545', '24', '92', 82, 84);
INSERT INTO inventory VALUES ('546', '25', '92', 29, 64);
INSERT INTO inventory VALUES ('547', '26', '92', 5, 7);
INSERT INTO inventory VALUES ('548', '27', '92', 3, 35);
INSERT INTO inventory VALUES ('549', '28', '92', 23, 46);
INSERT INTO inventory VALUES ('550', '29', '92', 21, 39);
INSERT INTO inventory VALUES ('551', '30', '92', 19, 21);
INSERT INTO inventory VALUES ('552', '31', '92', 24, 73);
INSERT INTO inventory VALUES ('553', '32', '92', 51, 89);
INSERT INTO inventory VALUES ('554', '33', '92', 22, 32);
INSERT INTO inventory VALUES ('555', '34', '92', 56, 95);
INSERT INTO inventory VALUES ('556', '35', '92', 47, 95);
INSERT INTO inventory VALUES ('557', '36', '92', 17, 24);
INSERT INTO inventory VALUES ('558', '37', '92', 0, 0);
INSERT INTO inventory VALUES ('559', '38', '92', 14, 53);
INSERT INTO inventory VALUES ('560', '39', '92', 65, 67);
INSERT INTO inventory VALUES ('561', '40', '92', 64, 95);
INSERT INTO inventory VALUES ('562', '41', '92', 5, 5);
INSERT INTO inventory VALUES ('563', '42', '92', 7, 10);
INSERT INTO inventory VALUES ('564', '43', '92', 34, 45);
INSERT INTO inventory VALUES ('565', '44', '92', 0, 3);
INSERT INTO inventory VALUES ('566', '45', '92', 20, 67);
INSERT INTO inventory VALUES ('567', '46', '92', 58, 92);
INSERT INTO inventory VALUES ('568', '47', '92', 21, 70);
INSERT INTO inventory VALUES ('569', '48', '92', 56, 62);
INSERT INTO inventory VALUES ('570', '49', '92', 0, 5);
INSERT INTO inventory VALUES ('571', '50', '92', 16, 97);
INSERT INTO inventory VALUES ('572', '51', '92', 6, 46);
INSERT INTO inventory VALUES ('573', '52', '92', 58, 84);
INSERT INTO inventory VALUES ('574', '53', '92', 25, 42);
INSERT INTO inventory VALUES ('575', '54', '92', 13, 40);
INSERT INTO inventory VALUES ('576', '55', '92', 18, 34);
INSERT INTO inventory VALUES ('577', '56', '92', 44, 92);
INSERT INTO inventory VALUES ('578', '57', '92', 0, 19);
INSERT INTO inventory VALUES ('579', '58', '92', 13, 67);
INSERT INTO inventory VALUES ('580', '59', '92', 18, 38);
INSERT INTO inventory VALUES ('581', '60', '92', 7, 7);
INSERT INTO inventory VALUES ('582', '61', '92', 6, 53);
INSERT INTO inventory VALUES ('583', '62', '92', 4, 25);
INSERT INTO inventory VALUES ('584', '63', '92', 31, 59);
INSERT INTO inventory VALUES ('585', '64', '92', 25, 40);
INSERT INTO inventory VALUES ('586', '65', '92', 2, 81);
INSERT INTO inventory VALUES ('587', '66', '92', 23, 81);
INSERT INTO inventory VALUES ('588', '67', '92', 9, 33);
INSERT INTO inventory VALUES ('589', '68', '92', 2, 37);
INSERT INTO inventory VALUES ('590', '69', '92', 53, 64);
INSERT INTO inventory VALUES ('591', '70', '92', 21, 22);
INSERT INTO inventory VALUES ('592', '71', '92', 7, 45);
INSERT INTO inventory VALUES ('593', '72', '92', 9, 25);
INSERT INTO inventory VALUES ('594', '73', '92', 0, 40);
INSERT INTO inventory VALUES ('595', '74', '92', 21, 34);
INSERT INTO inventory VALUES ('596', '75', '92', 33, 87);
INSERT INTO inventory VALUES ('597', '76', '92', 44, 48);
INSERT INTO inventory VALUES ('598', '77', '92', 64, 69);
INSERT INTO inventory VALUES ('599', '78', '92', 31, 56);
INSERT INTO inventory VALUES ('600', '79', '92', 11, 12);
INSERT INTO inventory VALUES ('601', '80', '92', 3, 7);
INSERT INTO inventory VALUES ('602', '81', '92', 26, 74);
INSERT INTO inventory VALUES ('603', '82', '92', 29, 46);
INSERT INTO inventory VALUES ('604', '83', '92', 1, 5);
INSERT INTO inventory VALUES ('605', '84', '92', 35, 37);
INSERT INTO inventory VALUES ('606', '85', '92', 12, 100);
INSERT INTO inventory VALUES ('607', '86', '92', 9, 18);
INSERT INTO inventory VALUES ('608', '87', '92', 49, 64);
INSERT INTO inventory VALUES ('95', '4', '87', 18, 30);
INSERT INTO inventory VALUES ('97', '6', '87', 10, 21);
INSERT INTO inventory VALUES ('96', '5', '87', 3, 38);
INSERT INTO inventory VALUES ('98', '7', '87', 43, 58);
INSERT INTO inventory VALUES ('99', '8', '87', 6, 12);
INSERT INTO inventory VALUES ('100', '9', '87', 0, 3);
INSERT INTO inventory VALUES ('101', '10', '87', 0, 31);
INSERT INTO inventory VALUES ('102', '11', '87', 73, 93);
INSERT INTO inventory VALUES ('103', '12', '87', 22, 25);
INSERT INTO inventory VALUES ('104', '13', '87', 44, 70);
INSERT INTO inventory VALUES ('105', '14', '87', 26, 50);
INSERT INTO inventory VALUES ('106', '15', '87', 36, 83);
INSERT INTO inventory VALUES ('107', '16', '87', 20, 59);
INSERT INTO inventory VALUES ('108', '17', '87', 28, 44);
INSERT INTO inventory VALUES ('109', '18', '87', 5, 50);
INSERT INTO inventory VALUES ('110', '19', '87', 2, 29);
INSERT INTO inventory VALUES ('111', '20', '87', 38, 54);
INSERT INTO inventory VALUES ('112', '21', '87', 4, 29);
INSERT INTO inventory VALUES ('113', '22', '87', 1, 59);
INSERT INTO inventory VALUES ('114', '23', '87', 20, 36);
INSERT INTO inventory VALUES ('115', '24', '87', 10, 10);
INSERT INTO inventory VALUES ('116', '25', '87', 58, 60);
INSERT INTO inventory VALUES ('117', '26', '87', 0, 18);
INSERT INTO inventory VALUES ('118', '27', '87', 29, 50);
INSERT INTO inventory VALUES ('119', '28', '87', 24, 34);
INSERT INTO inventory VALUES ('120', '29', '87', 36, 43);
INSERT INTO inventory VALUES ('121', '30', '87', 43, 64);
INSERT INTO inventory VALUES ('122', '31', '87', 79, 90);
INSERT INTO inventory VALUES ('123', '32', '87', 13, 13);
INSERT INTO inventory VALUES ('124', '33', '87', 9, 60);
INSERT INTO inventory VALUES ('125', '34', '87', 7, 13);
INSERT INTO inventory VALUES ('126', '35', '87', 43, 54);
INSERT INTO inventory VALUES ('127', '36', '87', 67, 69);
INSERT INTO inventory VALUES ('128', '37', '87', 1, 15);
INSERT INTO inventory VALUES ('129', '38', '87', 36, 44);
INSERT INTO inventory VALUES ('130', '39', '87', 1, 17);
INSERT INTO inventory VALUES ('131', '40', '87', 13, 16);
INSERT INTO inventory VALUES ('132', '41', '87', 24, 64);
INSERT INTO inventory VALUES ('133', '42', '87', 87, 99);
INSERT INTO inventory VALUES ('134', '43', '87', 27, 99);
INSERT INTO inventory VALUES ('135', '44', '87', 71, 71);
INSERT INTO inventory VALUES ('136', '45', '87', 9, 20);
INSERT INTO inventory VALUES ('137', '46', '87', 9, 67);
INSERT INTO inventory VALUES ('138', '47', '87', 19, 21);
INSERT INTO inventory VALUES ('139', '48', '87', 5, 5);
INSERT INTO inventory VALUES ('140', '49', '87', 82, 91);
INSERT INTO inventory VALUES ('141', '50', '87', 27, 42);
INSERT INTO inventory VALUES ('142', '51', '87', 51, 60);
INSERT INTO inventory VALUES ('143', '52', '87', 8, 72);
INSERT INTO inventory VALUES ('145', '54', '87', 3, 71);
INSERT INTO inventory VALUES ('144', '53', '87', 5, 13);
INSERT INTO inventory VALUES ('146', '55', '87', 55, 56);
INSERT INTO inventory VALUES ('147', '56', '87', 9, 90);
INSERT INTO inventory VALUES ('148', '57', '87', 3, 18);
INSERT INTO inventory VALUES ('149', '58', '87', 2, 14);
INSERT INTO inventory VALUES ('150', '59', '87', 54, 95);
INSERT INTO inventory VALUES ('151', '60', '87', 62, 70);
INSERT INTO inventory VALUES ('152', '61', '87', 18, 50);
INSERT INTO inventory VALUES ('153', '62', '87', 60, 78);
INSERT INTO inventory VALUES ('154', '63', '87', 23, 59);
INSERT INTO inventory VALUES ('155', '64', '87', 14, 23);
INSERT INTO inventory VALUES ('156', '65', '87', 2, 97);
INSERT INTO inventory VALUES ('157', '66', '87', 49, 50);
INSERT INTO inventory VALUES ('158', '67', '87', 47, 93);
INSERT INTO inventory VALUES ('159', '68', '87', 34, 42);
INSERT INTO inventory VALUES ('160', '69', '87', 3, 18);
INSERT INTO inventory VALUES ('161', '70', '87', 37, 84);
INSERT INTO inventory VALUES ('162', '71', '87', 22, 40);
INSERT INTO inventory VALUES ('163', '72', '87', 8, 61);
INSERT INTO inventory VALUES ('164', '73', '87', 2, 3);
INSERT INTO inventory VALUES ('165', '74', '87', 10, 16);
INSERT INTO inventory VALUES ('166', '75', '87', 53, 89);
INSERT INTO inventory VALUES ('167', '76', '87', 35, 60);
INSERT INTO inventory VALUES ('168', '77', '87', 57, 80);
INSERT INTO inventory VALUES ('169', '78', '87', 53, 81);
INSERT INTO inventory VALUES ('170', '79', '87', 32, 54);
INSERT INTO inventory VALUES ('171', '80', '87', 1, 4);
INSERT INTO inventory VALUES ('172', '81', '87', 78, 86);
INSERT INTO inventory VALUES ('173', '82', '87', 11, 21);
INSERT INTO inventory VALUES ('174', '83', '87', 28, 81);
INSERT INTO inventory VALUES ('175', '84', '87', 2, 57);
INSERT INTO inventory VALUES ('176', '85', '87', 30, 37);
INSERT INTO inventory VALUES ('177', '86', '87', 17, 80);
INSERT INTO inventory VALUES ('179', '2', '88', 10, 10);
INSERT INTO inventory VALUES ('178', '87', '87', 1, 9);
INSERT INTO inventory VALUES ('180', '3', '88', 1, 1);
INSERT INTO inventory VALUES ('181', '4', '88', 8, 27);
INSERT INTO inventory VALUES ('182', '5', '88', 3, 38);
INSERT INTO inventory VALUES ('183', '6', '88', 28, 76);
INSERT INTO inventory VALUES ('184', '7', '88', 40, 83);
INSERT INTO inventory VALUES ('185', '8', '88', 1, 4);
INSERT INTO inventory VALUES ('186', '9', '88', 87, 95);
INSERT INTO inventory VALUES ('187', '10', '88', 29, 35);
INSERT INTO inventory VALUES ('188', '11', '88', 10, 69);
INSERT INTO inventory VALUES ('189', '12', '88', 32, 86);
INSERT INTO inventory VALUES ('190', '13', '88', 27, 28);
INSERT INTO inventory VALUES ('191', '14', '88', 59, 66);
INSERT INTO inventory VALUES ('192', '15', '88', 59, 70);
INSERT INTO inventory VALUES ('193', '16', '88', 43, 70);
INSERT INTO inventory VALUES ('194', '17', '88', 50, 63);
INSERT INTO inventory VALUES ('195', '18', '88', 8, 20);
INSERT INTO inventory VALUES ('196', '19', '88', 20, 29);
INSERT INTO inventory VALUES ('197', '20', '88', 36, 50);
INSERT INTO inventory VALUES ('198', '21', '88', 40, 63);
INSERT INTO inventory VALUES ('199', '22', '88', 4, 96);
INSERT INTO inventory VALUES ('200', '23', '88', 70, 98);
INSERT INTO inventory VALUES ('201', '24', '88', 1, 1);
INSERT INTO inventory VALUES ('202', '25', '88', 17, 45);
INSERT INTO inventory VALUES ('203', '26', '88', 52, 97);
INSERT INTO inventory VALUES ('204', '27', '88', 0, 0);
INSERT INTO inventory VALUES ('205', '28', '88', 97, 98);
INSERT INTO inventory VALUES ('206', '29', '88', 26, 80);
INSERT INTO inventory VALUES ('207', '30', '88', 11, 33);
INSERT INTO inventory VALUES ('208', '31', '88', 10, 21);
INSERT INTO inventory VALUES ('209', '32', '88', 14, 36);
INSERT INTO inventory VALUES ('210', '33', '88', 71, 86);
INSERT INTO inventory VALUES ('211', '34', '88', 85, 100);
INSERT INTO inventory VALUES ('212', '35', '88', 3, 45);
INSERT INTO inventory VALUES ('213', '36', '88', 0, 3);
INSERT INTO inventory VALUES ('214', '37', '88', 17, 71);
INSERT INTO inventory VALUES ('215', '38', '88', 41, 75);
INSERT INTO inventory VALUES ('216', '39', '88', 37, 41);
INSERT INTO inventory VALUES ('217', '40', '88', 37, 49);
INSERT INTO inventory VALUES ('218', '41', '88', 1, 2);
INSERT INTO inventory VALUES ('219', '42', '88', 49, 72);
INSERT INTO inventory VALUES ('220', '43', '88', 24, 38);
INSERT INTO inventory VALUES ('221', '44', '88', 6, 66);
INSERT INTO inventory VALUES ('222', '45', '88', 31, 49);
INSERT INTO inventory VALUES ('223', '46', '88', 9, 10);
INSERT INTO inventory VALUES ('224', '47', '88', 57, 72);
INSERT INTO inventory VALUES ('225', '48', '88', 17, 24);
INSERT INTO inventory VALUES ('226', '49', '88', 41, 61);
INSERT INTO inventory VALUES ('227', '50', '88', 33, 87);
INSERT INTO inventory VALUES ('228', '51', '88', 11, 25);
INSERT INTO inventory VALUES ('229', '52', '88', 1, 8);
INSERT INTO inventory VALUES ('230', '53', '88', 14, 64);
INSERT INTO inventory VALUES ('231', '54', '88', 50, 89);
INSERT INTO inventory VALUES ('232', '55', '88', 16, 66);
INSERT INTO inventory VALUES ('233', '56', '88', 0, 6);
INSERT INTO inventory VALUES ('234', '57', '88', 18, 32);
INSERT INTO inventory VALUES ('235', '58', '88', 6, 6);
INSERT INTO inventory VALUES ('236', '59', '88', 68, 84);
INSERT INTO inventory VALUES ('237', '60', '88', 50, 74);
INSERT INTO inventory VALUES ('238', '61', '88', 7, 18);
INSERT INTO inventory VALUES ('239', '62', '88', 14, 49);
INSERT INTO inventory VALUES ('240', '63', '88', 3, 3);
INSERT INTO inventory VALUES ('241', '64', '88', 21, 83);
INSERT INTO inventory VALUES ('242', '65', '88', 48, 90);
INSERT INTO inventory VALUES ('243', '66', '88', 11, 65);
INSERT INTO inventory VALUES ('244', '67', '88', 29, 90);
INSERT INTO inventory VALUES ('245', '68', '88', 44, 45);
INSERT INTO inventory VALUES ('246', '69', '88', 23, 30);
INSERT INTO inventory VALUES ('247', '70', '88', 53, 71);
INSERT INTO inventory VALUES ('248', '71', '88', 50, 76);
INSERT INTO inventory VALUES ('249', '72', '88', 13, 20);
INSERT INTO inventory VALUES ('250', '73', '88', 6, 8);
INSERT INTO inventory VALUES ('251', '74', '88', 7, 11);
INSERT INTO inventory VALUES ('252', '75', '88', 0, 3);
INSERT INTO inventory VALUES ('253', '76', '88', 49, 51);
INSERT INTO inventory VALUES ('254', '77', '88', 37, 61);
INSERT INTO inventory VALUES ('255', '78', '88', 4, 78);
INSERT INTO inventory VALUES ('257', '80', '88', 23, 29);
INSERT INTO inventory VALUES ('256', '79', '88', 1, 5);
INSERT INTO inventory VALUES ('259', '82', '88', 1, 2);
INSERT INTO inventory VALUES ('258', '81', '88', 3, 52);
INSERT INTO inventory VALUES ('260', '83', '88', 65, 67);
INSERT INTO inventory VALUES ('261', '84', '88', 41, 87);
INSERT INTO inventory VALUES ('262', '85', '88', 20, 21);
INSERT INTO inventory VALUES ('93', '2', '87', 43, 56);
INSERT INTO inventory VALUES ('94', '3', '87', 27, 85);
INSERT INTO inventory VALUES ('263', '86', '88', 46, 94);
INSERT INTO inventory VALUES ('264', '87', '88', 64, 68);
INSERT INTO inventory VALUES ('265', '2', '89', 5, 78);
INSERT INTO inventory VALUES ('266', '3', '89', 29, 41);
INSERT INTO inventory VALUES ('267', '4', '89', 2, 39);
INSERT INTO inventory VALUES ('268', '5', '89', 57, 67);
INSERT INTO inventory VALUES ('269', '6', '89', 1, 2);
INSERT INTO inventory VALUES ('270', '7', '89', 68, 80);
INSERT INTO inventory VALUES ('271', '8', '89', 22, 81);
INSERT INTO inventory VALUES ('272', '9', '89', 9, 52);
INSERT INTO inventory VALUES ('273', '10', '89', 26, 42);
INSERT INTO inventory VALUES ('274', '11', '89', 42, 91);
INSERT INTO inventory VALUES ('275', '12', '89', 23, 35);
INSERT INTO inventory VALUES ('276', '13', '89', 38, 59);
INSERT INTO inventory VALUES ('277', '14', '89', 43, 51);
INSERT INTO inventory VALUES ('278', '15', '89', 19, 29);
INSERT INTO inventory VALUES ('279', '16', '89', 21, 29);
INSERT INTO inventory VALUES ('280', '17', '89', 18, 47);
INSERT INTO inventory VALUES ('281', '18', '89', 26, 52);
INSERT INTO inventory VALUES ('282', '19', '89', 18, 61);
INSERT INTO inventory VALUES ('283', '20', '89', 33, 97);
INSERT INTO inventory VALUES ('284', '21', '89', 1, 35);
INSERT INTO inventory VALUES ('285', '22', '89', 41, 65);
INSERT INTO inventory VALUES ('286', '23', '89', 16, 41);
INSERT INTO inventory VALUES ('287', '24', '89', 26, 32);
INSERT INTO inventory VALUES ('288', '25', '89', 0, 11);
INSERT INTO inventory VALUES ('289', '26', '89', 30, 52);
INSERT INTO inventory VALUES ('290', '27', '89', 29, 73);
INSERT INTO inventory VALUES ('291', '28', '89', 26, 86);
INSERT INTO inventory VALUES ('292', '29', '89', 48, 48);
INSERT INTO inventory VALUES ('293', '30', '89', 0, 68);
INSERT INTO inventory VALUES ('294', '31', '89', 25, 32);
INSERT INTO inventory VALUES ('295', '32', '89', 37, 80);
INSERT INTO inventory VALUES ('296', '33', '89', 12, 43);
INSERT INTO inventory VALUES ('297', '34', '89', 34, 89);
INSERT INTO inventory VALUES ('298', '35', '89', 54, 97);
INSERT INTO inventory VALUES ('299', '36', '89', 2, 18);
INSERT INTO inventory VALUES ('300', '37', '89', 13, 16);
INSERT INTO inventory VALUES ('301', '38', '89', 19, 54);
INSERT INTO inventory VALUES ('302', '39', '89', 16, 40);
INSERT INTO inventory VALUES ('303', '40', '89', 10, 93);
INSERT INTO inventory VALUES ('304', '41', '89', 35, 39);
INSERT INTO inventory VALUES ('305', '42', '89', 24, 25);
INSERT INTO inventory VALUES ('306', '43', '89', 5, 55);
INSERT INTO inventory VALUES ('307', '44', '89', 9, 43);
INSERT INTO inventory VALUES ('308', '45', '89', 36, 82);
INSERT INTO inventory VALUES ('309', '46', '89', 5, 8);
INSERT INTO inventory VALUES ('310', '47', '89', 18, 20);
INSERT INTO inventory VALUES ('311', '48', '89', 2, 9);
INSERT INTO inventory VALUES ('312', '49', '89', 34, 91);
INSERT INTO inventory VALUES ('313', '50', '89', 27, 55);
INSERT INTO inventory VALUES ('314', '51', '89', 11, 72);
INSERT INTO inventory VALUES ('315', '52', '89', 8, 13);
INSERT INTO inventory VALUES ('316', '53', '89', 4, 31);
INSERT INTO inventory VALUES ('317', '54', '89', 1, 1);
INSERT INTO inventory VALUES ('318', '55', '89', 7, 19);
INSERT INTO inventory VALUES ('319', '56', '89', 3, 35);
INSERT INTO inventory VALUES ('320', '57', '89', 58, 73);
INSERT INTO inventory VALUES ('321', '58', '89', 2, 32);
INSERT INTO inventory VALUES ('322', '59', '89', 51, 64);
INSERT INTO inventory VALUES ('323', '60', '89', 34, 79);
INSERT INTO inventory VALUES ('324', '61', '89', 44, 66);
INSERT INTO inventory VALUES ('325', '62', '89', 37, 46);
INSERT INTO inventory VALUES ('326', '63', '89', 10, 11);
INSERT INTO inventory VALUES ('327', '64', '89', 15, 74);
INSERT INTO inventory VALUES ('328', '65', '89', 8, 19);
INSERT INTO inventory VALUES ('329', '66', '89', 13, 26);
INSERT INTO inventory VALUES ('330', '67', '89', 0, 1);
INSERT INTO inventory VALUES ('331', '68', '89', 5, 17);
INSERT INTO inventory VALUES ('332', '69', '89', 0, 0);
INSERT INTO inventory VALUES ('333', '70', '89', 1, 48);
INSERT INTO inventory VALUES ('334', '71', '89', 13, 70);
INSERT INTO inventory VALUES ('335', '72', '89', 24, 68);
INSERT INTO inventory VALUES ('336', '73', '89', 21, 48);
INSERT INTO inventory VALUES ('337', '74', '89', 17, 68);
INSERT INTO inventory VALUES ('338', '75', '89', 72, 72);
INSERT INTO inventory VALUES ('339', '76', '89', 6, 24);
INSERT INTO inventory VALUES ('340', '77', '89', 18, 22);
INSERT INTO inventory VALUES ('341', '78', '89', 8, 24);
INSERT INTO inventory VALUES ('342', '79', '89', 26, 31);
INSERT INTO inventory VALUES ('343', '80', '89', 14, 19);
INSERT INTO inventory VALUES ('344', '81', '89', 10, 31);
INSERT INTO inventory VALUES ('345', '82', '89', 88, 92);
INSERT INTO inventory VALUES ('346', '83', '89', 5, 11);
INSERT INTO inventory VALUES ('347', '84', '89', 13, 72);
INSERT INTO inventory VALUES ('348', '85', '89', 18, 37);
INSERT INTO inventory VALUES ('349', '86', '89', 6, 12);
INSERT INTO inventory VALUES ('350', '87', '89', 79, 99);
INSERT INTO inventory VALUES ('351', '2', '90', 10, 19);
INSERT INTO inventory VALUES ('353', '4', '90', 8, 38);
INSERT INTO inventory VALUES ('352', '3', '90', 3, 6);
INSERT INTO inventory VALUES ('354', '5', '90', 26, 54);
INSERT INTO inventory VALUES ('355', '6', '90', 20, 73);
INSERT INTO inventory VALUES ('356', '7', '90', 30, 95);
INSERT INTO inventory VALUES ('357', '8', '90', 32, 93);
INSERT INTO inventory VALUES ('358', '9', '90', 4, 18);
INSERT INTO inventory VALUES ('359', '10', '90', 32, 94);
INSERT INTO inventory VALUES ('360', '11', '90', 57, 80);
INSERT INTO inventory VALUES ('361', '12', '90', 3, 6);
INSERT INTO inventory VALUES ('362', '13', '90', 40, 58);
INSERT INTO inventory VALUES ('363', '14', '90', 54, 91);
INSERT INTO inventory VALUES ('364', '15', '90', 10, 11);
INSERT INTO inventory VALUES ('365', '16', '90', 34, 58);
INSERT INTO inventory VALUES ('366', '17', '90', 34, 99);
INSERT INTO inventory VALUES ('367', '18', '90', 72, 90);
INSERT INTO inventory VALUES ('368', '19', '90', 13, 76);
INSERT INTO inventory VALUES ('369', '20', '90', 37, 71);
INSERT INTO inventory VALUES ('370', '21', '90', 21, 39);
INSERT INTO inventory VALUES ('371', '22', '90', 4, 20);
INSERT INTO inventory VALUES ('372', '23', '90', 11, 73);
INSERT INTO inventory VALUES ('373', '24', '90', 18, 100);
INSERT INTO inventory VALUES ('375', '26', '90', 0, 1);
INSERT INTO inventory VALUES ('374', '25', '90', 26, 62);
INSERT INTO inventory VALUES ('376', '27', '90', 10, 28);
INSERT INTO inventory VALUES ('377', '28', '90', 68, 78);
INSERT INTO inventory VALUES ('378', '29', '90', 10, 73);
INSERT INTO inventory VALUES ('379', '30', '90', 73, 96);
INSERT INTO inventory VALUES ('380', '31', '90', 35, 75);
INSERT INTO inventory VALUES ('381', '32', '90', 58, 88);
INSERT INTO inventory VALUES ('382', '33', '90', 14, 26);
INSERT INTO inventory VALUES ('383', '34', '90', 22, 24);
INSERT INTO inventory VALUES ('384', '35', '90', 23, 72);
INSERT INTO inventory VALUES ('385', '36', '90', 23, 59);
INSERT INTO inventory VALUES ('387', '38', '90', 51, 71);
INSERT INTO inventory VALUES ('386', '37', '90', 3, 6);
INSERT INTO inventory VALUES ('388', '39', '90', 48, 60);
INSERT INTO inventory VALUES ('389', '40', '90', 44, 56);
INSERT INTO inventory VALUES ('390', '41', '90', 25, 36);
INSERT INTO inventory VALUES ('391', '42', '90', 32, 83);
INSERT INTO inventory VALUES ('392', '43', '90', 77, 92);
INSERT INTO inventory VALUES ('393', '44', '90', 30, 38);
INSERT INTO inventory VALUES ('394', '45', '90', 43, 49);
INSERT INTO inventory VALUES ('395', '46', '90', 23, 27);
INSERT INTO inventory VALUES ('396', '47', '90', 78, 84);
INSERT INTO inventory VALUES ('397', '48', '90', 26, 48);
INSERT INTO inventory VALUES ('398', '49', '90', 15, 52);
INSERT INTO inventory VALUES ('399', '50', '90', 4, 45);
INSERT INTO inventory VALUES ('400', '51', '90', 53, 77);
INSERT INTO inventory VALUES ('401', '52', '90', 5, 6);
INSERT INTO inventory VALUES ('402', '53', '90', 17, 30);
INSERT INTO inventory VALUES ('403', '54', '90', 4, 44);
INSERT INTO inventory VALUES ('404', '55', '90', 12, 20);
INSERT INTO inventory VALUES ('405', '56', '90', 15, 25);
INSERT INTO inventory VALUES ('406', '57', '90', 1, 33);
INSERT INTO inventory VALUES ('407', '58', '90', 22, 34);
INSERT INTO inventory VALUES ('408', '59', '90', 6, 12);
INSERT INTO inventory VALUES ('409', '60', '90', 3, 9);
INSERT INTO inventory VALUES ('410', '61', '90', 41, 59);
INSERT INTO inventory VALUES ('411', '62', '90', 16, 32);
INSERT INTO inventory VALUES ('412', '63', '90', 7, 15);
INSERT INTO inventory VALUES ('413', '64', '90', 49, 95);
INSERT INTO inventory VALUES ('414', '65', '90', 41, 45);
INSERT INTO inventory VALUES ('416', '67', '90', 11, 39);
INSERT INTO inventory VALUES ('415', '66', '90', 18, 45);
INSERT INTO inventory VALUES ('417', '68', '90', 26, 84);
INSERT INTO inventory VALUES ('418', '69', '90', 3, 4);
INSERT INTO inventory VALUES ('419', '70', '90', 72, 98);
INSERT INTO inventory VALUES ('420', '71', '90', 26, 28);
INSERT INTO inventory VALUES ('421', '72', '90', 2, 2);
INSERT INTO inventory VALUES ('422', '73', '90', 57, 90);
INSERT INTO inventory VALUES ('423', '74', '90', 12, 75);
INSERT INTO inventory VALUES ('424', '75', '90', 23, 37);
INSERT INTO inventory VALUES ('425', '76', '90', 22, 22);
INSERT INTO inventory VALUES ('426', '77', '90', 30, 86);
INSERT INTO inventory VALUES ('427', '78', '90', 44, 82);
INSERT INTO inventory VALUES ('428', '79', '90', 13, 17);
INSERT INTO inventory VALUES ('429', '80', '90', 38, 45);
INSERT INTO inventory VALUES ('430', '81', '90', 26, 91);
INSERT INTO inventory VALUES ('431', '82', '90', 34, 41);
INSERT INTO inventory VALUES ('432', '83', '90', 19, 43);
INSERT INTO inventory VALUES ('433', '84', '90', 43, 43);
INSERT INTO inventory VALUES ('434', '85', '90', 34, 69);
INSERT INTO inventory VALUES ('435', '86', '90', 10, 25);
INSERT INTO inventory VALUES ('436', '87', '90', 18, 34);
INSERT INTO inventory VALUES ('437', '2', '91', 25, 98);
INSERT INTO inventory VALUES ('438', '3', '91', 15, 28);
INSERT INTO inventory VALUES ('439', '4', '91', 56, 97);
INSERT INTO inventory VALUES ('440', '5', '91', 20, 30);


--
-- Data for Name: location; Type: TABLE DATA; Schema: strongloop; Owner: strongloop
--

INSERT INTO location VALUES ('87', '7153 East Thomas Road', 'Scottsdale', '85251', 'Phoenix Equipment Rentals', '(-111.92717380000001,33.480344500000008)');
INSERT INTO location VALUES ('91', '2799 Broadway', 'New York', '10025', 'Cascabel Armory', '(-73.967696500000002,40.802980699999999)');
INSERT INTO location VALUES ('89', '1850 El Camino Real', 'Menlo Park', '94027', 'Military Weaponry', '(-122.194253,37.459524999999999)');
INSERT INTO location VALUES ('92', '32/66-70 Marine Parade', 'Coolangatta', '4225', 'Marine Parade', '(153.53697199999999,-28.167598000000002)');
INSERT INTO location VALUES ('90', 'Tolstraat 200', 'Amsterdam', '1074', 'Munitions Shopmore', '(4.9074754999999994,52.353063800000001)');
INSERT INTO location VALUES ('88', '390 Lang Road', 'Burlingame', '94010', 'Bay Area Firearms', '(-122.3381437,37.587439099999997)');


--
-- Data for Name: product; Type: TABLE DATA; Schema: strongloop; Owner: strongloop
--

INSERT INTO product VALUES ('4', 'M9', 53, 75, 15, NULL, 'Single');
INSERT INTO product VALUES ('3', 'M1911', 53, 50, 7, NULL, 'Single');
INSERT INTO product VALUES ('6', 'Makarov SD', 0, 50, 8, NULL, 'Single');
INSERT INTO product VALUES ('7', 'PDW', 53, 75, 30, NULL, '["Single","Full auto"]');
INSERT INTO product VALUES ('8', 'Makarov PM', 53, 50, 8, NULL, 'Single');
INSERT INTO product VALUES ('9', 'Double-barreled Shotgun', 90, NULL, 2, NULL, 'Single');
INSERT INTO product VALUES ('10', 'Saiga 12K', 90, 250, 8, NULL, 'Single');
INSERT INTO product VALUES ('11', 'Remington 870 (Flashlight)', 90, NULL, 8, 'Flashlight', 'Single');
INSERT INTO product VALUES ('12', 'Revolver', 53, 100, 6, NULL, 'Single');
INSERT INTO product VALUES ('13', 'Winchester 1866', 125, 150, 15, NULL, 'Single');
INSERT INTO product VALUES ('14', 'Bizon PP-19 SD', 0, 100, 64, 'Silenced', '["Single","Full auto"]');
INSERT INTO product VALUES ('15', 'MP5SD6', 0, 100, 30, 'Silenced', '["Single","Burst","Full auto"]');
INSERT INTO product VALUES ('16', 'MP5A5', 53, 100, 30, NULL, '["Single","Burst","Full auto"]');
INSERT INTO product VALUES ('17', 'AK-107', 80, 400, 30, 'Kobra sight', '["Single","Burst","Full auto"]');
INSERT INTO product VALUES ('18', 'AK-107 GL', 80, NULL, 30, 'Kobra sight', '["Single","Burst","Full auto"]');
INSERT INTO product VALUES ('19', 'AK-107 GL PSO', 80, 400, 30, '["Scope","GP-25 launcher"]', '["Single","Burst","Full auto"]');
INSERT INTO product VALUES ('20', 'AK-107 PSO', 80, 600, 30, 'Scope', '["Single","Burst","Full auto"]');
INSERT INTO product VALUES ('21', 'AK-74', 80, 300, 30, NULL, '["Single","Full auto"]');
INSERT INTO product VALUES ('22', 'AKM', 149, 400, 30, NULL, '["Single","Full auto"]');
INSERT INTO product VALUES ('23', 'AKS', 149, 200, 30, NULL, '["Single","Full auto"]');
INSERT INTO product VALUES ('24', 'AKS (gold)', 149, 200, 30, NULL, '["Single","Full auto"]');
INSERT INTO product VALUES ('25', 'M1014', 90, NULL, 8, NULL, 'Single');
INSERT INTO product VALUES ('26', 'AKS-74 Kobra', 80, 300, 30, 'Kobra sight', '["Single","Full auto"]');
INSERT INTO product VALUES ('27', 'AKS-74 PSO', 80, 400, 30, 'Scope', '["Single","Full auto"]');
INSERT INTO product VALUES ('28', 'AKS-74U', 80, 200, 30, NULL, '["Single","Full auto"]');
INSERT INTO product VALUES ('29', 'AKS-74UN Kobra', 0, 300, 30, '["Kobra sight","Silenced"]', '["Single","Full auto"]');
INSERT INTO product VALUES ('30', 'AK-74 GP-25', 80, 300, 30, 'GP-25 launcher', '["Single","Full auto"]');
INSERT INTO product VALUES ('31', 'FN FAL AN/PVS-4', 180, 400, 20, 'NV scope', '["Single","Burst"]');
INSERT INTO product VALUES ('32', 'G36', 80, 400, 30, '["Scope","Aimpoint sight"]', '["Single","Burst","Full auto"]');
INSERT INTO product VALUES ('33', 'FN FAL', 180, 400, 20, NULL, '["Single","Burst"]');
INSERT INTO product VALUES ('34', 'G36 C', 80, 300, 30, NULL, '["Single","Burst","Full auto"]');
INSERT INTO product VALUES ('35', 'G36-C SD (camo)', 0, 300, 30, '["Aimpoint sight","Silenced"]', '["Single","Burst","Full auto"]');
INSERT INTO product VALUES ('36', 'G36A (camo)', 80, 400, 30, '["Scope","Aimpoint sight"]', '["Single","Burst","Full auto"]');
INSERT INTO product VALUES ('37', 'G36C (camo)', 80, 300, 30, NULL, '["Single","Burst","Full auto"]');
INSERT INTO product VALUES ('38', 'G36 K', 80, 400, 30, '["Scope","Aimpoint sight"]', '["Single","Burst","Full auto"]');
INSERT INTO product VALUES ('39', 'G36C-SD', 0, 300, 30, 'Aimpoint sight', '["Single","Burst","Full auto"]');
INSERT INTO product VALUES ('40', 'G36K (camo)', 80, 400, 30, '["Scope","Aimpoint sight"]', '["Single","Burst","Full auto"]');
INSERT INTO product VALUES ('41', 'L85A2 ACOG GL', 80, 600, 30, '["ACOG scope","M203 launcher"]', '["Single","Full auto"]');
INSERT INTO product VALUES ('42', 'L85A2 SUSAT', 80, 300, 30, 'SUSAT optical scope', '["Single","Full auto"]');
INSERT INTO product VALUES ('43', 'M16A2', 80, 400, 30, NULL, '["Single","Burst"]');
INSERT INTO product VALUES ('44', 'L85A2 AWS', 80, 300, 30, '["Thermal scope","NV scope","Laser sight","Variable zoom"]', '["Single","Full auto"]');
INSERT INTO product VALUES ('45', 'L85A2 Holo', 80, 300, 30, 'Holographic sight', '["Single","Full auto"]');
INSERT INTO product VALUES ('46', 'Lee Enfield', 162, 400, 10, NULL, 'Single');
INSERT INTO product VALUES ('47', 'M16A4 ACOG', 80, 600, 30, 'ACOG scope', '["Single","Burst"]');
INSERT INTO product VALUES ('49', 'M16A2 M203', 80, 400, 30, 'M203 launcher', '["Single","Burst"]');
INSERT INTO product VALUES ('48', 'M4A1', 80, 300, 30, NULL, '["Single","Full auto"]');
INSERT INTO product VALUES ('50', 'M4A1 Holo', 80, 300, 30, '["Holographic sight","M203 launcher"]', '["Single","Full auto"]');
INSERT INTO product VALUES ('51', 'M4A1 CCO', 80, 300, 30, 'Aimpoint sight', '["Single","Full auto"]');
INSERT INTO product VALUES ('52', 'M4A1 CCO SD', 0, 200, 30, '["Aimpoint sight","Silenced"]', '["Single","Full auto"]');
INSERT INTO product VALUES ('53', 'M4A1 M203 RCO', 80, 600, 30, '["ACOG sight","M203 launcher"]', '["Single","Full auto"]');
INSERT INTO product VALUES ('54', 'M4A3 CCO', 80, 300, 30, '["Aimpoint sight","Flashlight"]', '["Single","Full auto"]');
INSERT INTO product VALUES ('55', 'RPK', 80, 400, 30, NULL, '["Single","Full auto"]');
INSERT INTO product VALUES ('56', 'Sa-58 CCO', 149, 300, 30, 'Aimpoint sight', '["Single","Full auto"]');
INSERT INTO product VALUES ('57', 'Sa-58P', 149, 400, 30, NULL, '["Single","Full auto"]');
INSERT INTO product VALUES ('58', 'Sa-58V', 149, 200, 30, NULL, '["Single","Full auto"]');
INSERT INTO product VALUES ('59', 'Sa-58V ACOG', 149, 400, 30, 'ACOG sight', '["Single","Full auto"]');
INSERT INTO product VALUES ('60', 'ER7 RFW', 180, 2000, 25, '["Scope","Aimpoint sight"]', 'Single');
INSERT INTO product VALUES ('61', 'AS50', 455, 1600, 5, 'Scope', 'Single');
INSERT INTO product VALUES ('62', 'KSVK', 455, 800, 5, 'Scope', 'Single');
INSERT INTO product VALUES ('63', 'CZ550', 180, 800, 5, 'Scope', 'Single');
INSERT INTO product VALUES ('64', 'DMR', 180, 800, 20, 'Scope', 'Single');
INSERT INTO product VALUES ('65', 'M107', 455, 1200, 10, 'Scope', 'Single');
INSERT INTO product VALUES ('66', 'M24', 180, 800, 5, 'Scope', 'Single');
INSERT INTO product VALUES ('67', 'M40A3', 180, 800, 5, '["Scope","Camo"]', 'Single');
INSERT INTO product VALUES ('68', 'M14 AIM', 180, 500, 20, 'Aimpoint sight', 'Single');
INSERT INTO product VALUES ('69', 'M240', 180, 400, 100, NULL, 'Full auto');
INSERT INTO product VALUES ('70', 'MG36', 80, 400, 100, 'Aimpoint sight', '["Single","Burst","Full auto"]');
INSERT INTO product VALUES ('72', 'PKM', 180, 400, 100, NULL, 'Full auto');
INSERT INTO product VALUES ('71', 'SVD Camo', 180, 1200, 10, '["Scope","Camo"]', 'Single');
INSERT INTO product VALUES ('73', 'Mk 48 Mod 0', 180, 400, 100, 'Aimpoint sight', 'Full auto');
INSERT INTO product VALUES ('74', 'M249 SAW', 80, 300, 200, NULL, 'Full auto');
INSERT INTO product VALUES ('75', 'Crowbar', 2, 1, NULL, NULL, 'Single');
INSERT INTO product VALUES ('76', 'Hatchet', 2, 1, NULL, NULL, 'Single');
INSERT INTO product VALUES ('77', 'PKP', 180, 600, 100, 'Scope', 'Full auto');
INSERT INTO product VALUES ('78', 'Machete', 2, 1, NULL, NULL, 'Single');
INSERT INTO product VALUES ('79', 'M67 Frag Grenade', NULL, NULL, NULL, NULL, NULL);
INSERT INTO product VALUES ('80', 'Compound Crossbow', 3, 30, 1, NULL, 'Single');
INSERT INTO product VALUES ('81', 'Smoke Grenade', NULL, NULL, NULL, NULL, NULL);
INSERT INTO product VALUES ('82', 'M136 Launcher', 160, 1000, 1, NULL, 'Single');
INSERT INTO product VALUES ('83', '30Rnd. AK SD', 0, NULL, 30, NULL, NULL);
INSERT INTO product VALUES ('84', '30rnd G36 SD', 0, NULL, 30, NULL, NULL);
INSERT INTO product VALUES ('85', 'G36 Mag.', 80, NULL, 30, NULL, NULL);
INSERT INTO product VALUES ('86', 'Flashlight', NULL, NULL, NULL, NULL, NULL);
INSERT INTO product VALUES ('87', 'NV Goggles', NULL, NULL, NULL, NULL, NULL);
INSERT INTO product VALUES ('2', 'G17', 53, 75, 15, 'Flashlight', 'Single');
INSERT INTO product VALUES ('5', 'M9 SD', 0, 75, 15, 'Silenced', 'Single');


--
-- Data for Name: reservation; Type: TABLE DATA; Schema: strongloop; Owner: strongloop
--



--
-- Data for Name: session; Type: TABLE DATA; Schema: strongloop; Owner: strongloop
--



SET search_path = public, pg_catalog;

--
-- Name: TestGeo_pkey; Type: CONSTRAINT; Schema: public; Owner: strongloop
--

ALTER TABLE ONLY "TestGeo"
    ADD CONSTRAINT "TestGeo_pkey" PRIMARY KEY (id);


--
-- Name: account_pkey; Type: CONSTRAINT; Schema: public; Owner: strongloop
--

ALTER TABLE ONLY account
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);


--
-- Name: demo_pkey; Type: CONSTRAINT; Schema: public; Owner: strongloop
--

ALTER TABLE ONLY demo
    ADD CONSTRAINT demo_pkey PRIMARY KEY (id);


--
-- Name: park1_pkey; Type: CONSTRAINT; Schema: public; Owner: strongloop
--

ALTER TABLE ONLY park1
    ADD CONSTRAINT park1_pkey PRIMARY KEY (id);


--
-- Name: population_pkey; Type: CONSTRAINT; Schema: public; Owner: strongloop
--

ALTER TABLE ONLY population
    ADD CONSTRAINT population_pkey PRIMARY KEY (id);


--
-- Name: postgres_pkey; Type: CONSTRAINT; Schema: public; Owner: strongloop
--

ALTER TABLE ONLY postgres
    ADD CONSTRAINT postgres_pkey PRIMARY KEY (id);


--
-- Name: testmodel-postgresql_pkey; Type: CONSTRAINT; Schema: public; Owner: strongloop
--

ALTER TABLE ONLY "testmodel-postgresql"
    ADD CONSTRAINT "testmodel-postgresql_pkey" PRIMARY KEY (id);


SET search_path = strongloop, pg_catalog;

--
-- Name: GeoPoint_pkey; Type: CONSTRAINT; Schema: strongloop; Owner: strongloop
--

ALTER TABLE ONLY "GeoPoint"
    ADD CONSTRAINT "GeoPoint_pkey" PRIMARY KEY (id);


--
-- Name: customer_pkey; Type: CONSTRAINT; Schema: strongloop; Owner: strongloop
--

ALTER TABLE ONLY customer
    ADD CONSTRAINT customer_pkey PRIMARY KEY (id);


--
-- Name: inventory_pkey; Type: CONSTRAINT; Schema: strongloop; Owner: strongloop
--

ALTER TABLE ONLY inventory
    ADD CONSTRAINT inventory_pkey PRIMARY KEY (id);


--
-- Name: location_pkey; Type: CONSTRAINT; Schema: strongloop; Owner: strongloop
--

ALTER TABLE ONLY location
    ADD CONSTRAINT location_pkey PRIMARY KEY (id);


--
-- Name: product_pkey; Type: CONSTRAINT; Schema: strongloop; Owner: strongloop
--

ALTER TABLE ONLY product
    ADD CONSTRAINT product_pkey PRIMARY KEY (id);


--
-- Name: session_pkey; Type: CONSTRAINT; Schema: strongloop; Owner: strongloop
--

ALTER TABLE ONLY session
    ADD CONSTRAINT session_pkey PRIMARY KEY (id);


--
-- Name: location_fk; Type: FK CONSTRAINT; Schema: strongloop; Owner: strongloop
--

ALTER TABLE ONLY inventory
    ADD CONSTRAINT location_fk FOREIGN KEY (location_id) REFERENCES location(id);


--
-- Name: product_fk; Type: FK CONSTRAINT; Schema: strongloop; Owner: strongloop
--

ALTER TABLE ONLY inventory
    ADD CONSTRAINT product_fk FOREIGN KEY (product_id) REFERENCES product(id);


--
-- Name: reservation_customer_fk; Type: FK CONSTRAINT; Schema: strongloop; Owner: strongloop
--

ALTER TABLE ONLY reservation
    ADD CONSTRAINT reservation_customer_fk FOREIGN KEY (customer_id) REFERENCES customer(id);


--
-- Name: reservation_location_fk; Type: FK CONSTRAINT; Schema: strongloop; Owner: strongloop
--

ALTER TABLE ONLY reservation
    ADD CONSTRAINT reservation_location_fk FOREIGN KEY (location_id) REFERENCES location(id);


--
-- Name: reservation_product_fk; Type: FK CONSTRAINT; Schema: strongloop; Owner: strongloop
--

ALTER TABLE ONLY reservation
    ADD CONSTRAINT reservation_product_fk FOREIGN KEY (product_id) REFERENCES product(id);


--
-- Name: public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

