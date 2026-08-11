import { useLocation } from 'react-router-dom';
import type { PageContext } from '../../services/chatApi';

/**
 * Describes the page the user is on so the assistant can resolve "this
 * project" without being told the id.
 *
 * Matched with regexes rather than useParams because the widget is mounted at
 * the layout level, above the route that owns those params.
 *
 * This is a hint only. It is client-supplied, the server treats it as
 * unverified, and every id in it still goes through the scoped repository.
 */
export function usePageContext(): PageContext {
  const { pathname } = useLocation();

  const boq = pathname.match(/^\/projects\/([^/]+)\/boq/);
  if (boq) return { route: pathname, label: 'BOQ tree', project_id: boq[1] };

  const project = pathname.match(/^\/projects\/([^/]+)$/);
  if (project) return { route: pathname, label: 'Project detail', project_id: project[1] };

  const review = pathname.match(/^\/reviews\/([^/]+)$/);
  if (review) return { route: pathname, label: 'Review detail', review_id: review[1] };

  if (pathname.startsWith('/reviews')) return { route: pathname, label: 'Review queue' };
  if (pathname.startsWith('/projects')) return { route: pathname, label: 'Project list' };
  if (pathname.startsWith('/dashboard')) return { route: pathname, label: 'Dashboard' };

  return { route: pathname };
}
