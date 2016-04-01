--
-- Name: waytasks; Type: TABLE; Schema: public; Owner: -; Tablespace:
--

CREATE TABLE waytasks (
    id serial PRIMARY KEY,
    way_id bigint NOT NULL,
    adminids bigint[] NOT NULL,
    type character varying(255) NOT NULL,
    details character varying(255) NOT NULL
);

CREATE INDEX waytasks_way_id_idx ON waytasks USING btree (way_id);
CREATE INDEX waytasks_adminids_idx ON waytasks USING GIN (adminids);