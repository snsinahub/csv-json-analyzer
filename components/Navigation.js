'use client';

import { useState } from 'react';
import { Navbar, Nav, Container, Dropdown } from 'react-bootstrap';
import { Icon } from 'semantic-ui-react';
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function Navigation() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  
  const handleSignIn = () => {
    signIn('github', { callbackUrl: pathname || '/' });
  };
  
  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };
  
  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand as={Link} href="/">
          <Icon name="file excel outline" /> CSV Analyzer
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} href="/">
              <Icon name="home" /> Home
            </Nav.Link>
            <Nav.Link as={Link} href="/analyze">
              <Icon name="chart line" /> Analyze
            </Nav.Link>
            <Nav.Link as={Link} href="/table-view">
              <Icon name="table" /> Table View
            </Nav.Link>
            <Nav.Link as={Link} href="/schema-designer">
              <Icon name="pencil" /> Schema Designer
            </Nav.Link>
            <Nav.Link as={Link} href="/data-generator">
              <Icon name="magic" /> Data Generator
            </Nav.Link>
            <Nav.Link as={Link} href="/generate">
              <Icon name="plus" /> Generate
            </Nav.Link>
            <Nav.Link as={Link} href="/update">
              <Icon name="edit" /> Update
            </Nav.Link>
            <Nav.Link as={Link} href="/duckdb-query">
              <Icon name="database" /> DuckDB
            </Nav.Link>
            
            {/* Authentication Section */}
            <Nav.Item className="ms-3">
              {status === 'loading' ? (
                <Nav.Link disabled>
                  <Icon name="spinner" loading />
                </Nav.Link>
              ) : session ? (
                <Dropdown align="end">
                  <Dropdown.Toggle 
                    variant="outline-light" 
                    id="user-dropdown"
                    className="d-flex align-items-center"
                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)' }}
                  >
                    {session.user?.image && (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        width={24}
                        height={24}
                        className="rounded-circle me-2"
                        style={{ objectFit: 'cover' }}
                      />
                    )}
                    <span>{session.user?.name || session.user?.email}</span>
                  </Dropdown.Toggle>

                  <Dropdown.Menu variant="dark">
                    <Dropdown.ItemText>
                      <div className="text-white-50 small">Signed in as</div>
                      <div className="fw-bold">{session.user?.email}</div>
                      {session.user?.username && (
                        <div className="text-white-50 small">@{session.user.username}</div>
                      )}
                    </Dropdown.ItemText>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleSignOut}>
                      <Icon name="sign out" /> Sign Out
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <button
                  className="btn btn-outline-light btn-sm"
                  onClick={handleSignIn}
                >
                  <Icon name="github" /> Sign in with GitHub
                </button>
              )}
            </Nav.Item>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
