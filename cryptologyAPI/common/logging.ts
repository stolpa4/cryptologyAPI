import { log } from '../deps.ts';
import { API_NAME } from './constants.ts';

export function getLogger(name: string | undefined = undefined) {
    return log.getLogger(compoundHierarchicalLogName(name));
}

function compoundHierarchicalLogName(name: string | undefined = undefined): string {
    return name ? `${API_NAME}.${name}` : API_NAME;
}

export const exportedForTesting = {
    compoundHierarchicalLogName,
};
