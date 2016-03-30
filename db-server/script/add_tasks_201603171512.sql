--
-- Name: admin_tasks; Type: TABLE; Schema: public; Owner: -; Tablespace:
--

CREATE TABLE admin_tasks (
    id serial PRIMARY KEY,
    way_id bigint NOT NULL,
    adminids bigint[] NOT NULL,
    type character varying(255) NOT NULL,
    details character varying(255) NOT NULL
);

CREATE INDEX admin_tasks_way_id_idx ON admin_tasks USING btree (way_id);
CREATE INDEX admin_tasks_adminids_idx ON admin_tasks USING GIN (adminids);