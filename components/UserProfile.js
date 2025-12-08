'use client';

import { useSession } from 'next-auth/react';
import { Card } from 'react-bootstrap';
import { Icon } from 'semantic-ui-react';
import Image from 'next/image';

export default function UserProfile() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <Card className="mb-4">
        <Card.Body className="text-center">
          <Icon name="spinner" loading size="large" />
          <p className="mt-2 mb-0">Loading...</p>
        </Card.Body>
      </Card>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <Card className="mb-4 border-primary">
      <Card.Header className="bg-primary text-white">
        <Icon name="user" /> User Profile
      </Card.Header>
      <Card.Body>
        <div className="d-flex align-items-center">
          {session.user?.image && (
            <Image
              src={session.user.image}
              alt={session.user.name || 'User'}
              width={64}
              height={64}
              className="rounded-circle me-3"
              style={{ objectFit: 'cover' }}
            />
          )}
          <div>
            <h5 className="mb-1">{session.user?.name}</h5>
            {session.user?.email && (
              <p className="text-muted mb-1">
                <Icon name="mail" /> {session.user.email}
              </p>
            )}
            {session.user?.username && (
              <p className="text-muted mb-0">
                <Icon name="github" /> @{session.user.username}
              </p>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}
