--
-- Name: admin_stats; Type: TABLE; Schema: public; Owner: -; Tablespace:
--

CREATE TABLE admin_stats (
    id bigint NOT NULL,
    measure character varying(255) NOT NULL,
    value numeric(40, 20) NOT NULL
);

CREATE INDEX admin_stats_idx ON admin_stats USING btree (id);