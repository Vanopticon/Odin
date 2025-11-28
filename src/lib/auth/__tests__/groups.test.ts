import { describe, it, expect } from 'vitest';
import { groupsGrantPermission, parseGroupsHeader } from '../groups';

describe('groups helpers', () => {
	it('parseGroupsHeader returns empty array for null or empty', () => {
		expect(parseGroupsHeader(null)).toEqual([]);
		expect(parseGroupsHeader('')).toEqual([]);
	});

	it('parseGroupsHeader splits and trims header', () => {
		expect(parseGroupsHeader('a,b , c')).toEqual(['a', 'b', 'c']);
		expect(parseGroupsHeader('  one  ,two')).toEqual(['one', 'two']);
	});

	it('groupsGrantPermission respects wildcard and explicit permissions', () => {
		// wildcard group
		expect(groupsGrantPermission(['odin_admins'], 'anything:here')).toBe(true);

		// explicit permission
		expect(groupsGrantPermission(['triggers_viewer'], 'view:triggers')).toBe(true);

		// missing permission
		expect(groupsGrantPermission(['triggers_viewer'], 'manage:triggers')).toBe(false);

		// unknown groups
		expect(groupsGrantPermission(['no_such_group'], 'view:triggers')).toBe(false);
	});
});
