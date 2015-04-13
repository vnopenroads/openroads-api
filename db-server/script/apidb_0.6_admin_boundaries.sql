--
-- Name: admin_boundaries; Type: TABLE; Schema: public; Owner: -; Tablespace:
--

CREATE TABLE admin_boundaries (
    id bigint NOT NULL,
    geo json NOT NULL
);

ALTER TABLE ONLY admin_boundaries
  ADD CONSTRAINT id_pkey PRIMARY KEY (id);

CREATE INDEX admin_boundaries_idx ON admin_boundaries USING btree (id);
