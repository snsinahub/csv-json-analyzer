'use client';

import { Navbar, Nav, Container } from 'react-bootstrap';
import { Icon } from 'semantic-ui-react';
import Link from 'next/link';

export default function Navigation() {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        <Link href="/" passHref legacyBehavior>
          <Navbar.Brand>
            <Icon name="file excel outline" /> CSV Analyzer
          </Navbar.Brand>
        </Link>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Link href="/" passHref legacyBehavior>
              <Nav.Link as="span">
                <Icon name="home" /> Home
              </Nav.Link>
            </Link>
            <Link href="/analyze" passHref legacyBehavior>
              <Nav.Link as="span">
                <Icon name="chart line" /> Analyze
              </Nav.Link>
            </Link>
            <Link href="/table-view" passHref legacyBehavior>
              <Nav.Link as="span">
                <Icon name="table" /> Table View
              </Nav.Link>
            </Link>
            <Link href="/schema-designer" passHref legacyBehavior>
              <Nav.Link as="span">
                <Icon name="pencil" /> Schema Designer
              </Nav.Link>
            </Link>
            <Link href="/data-generator" passHref legacyBehavior>
              <Nav.Link as="span">
                <Icon name="magic" /> Data Generator
              </Nav.Link>
            </Link>
            <Link href="/generate" passHref legacyBehavior>
              <Nav.Link as="span">
                <Icon name="plus" /> Generate
              </Nav.Link>
            </Link>
            <Link href="/update" passHref legacyBehavior>
              <Nav.Link as="span">
                <Icon name="edit" /> Update
              </Nav.Link>
            </Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
