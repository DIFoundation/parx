// utils/abi-mapper.ts
export const mapSolidityTypeToInput = (type: string) => {
    if (type.startsWith('uint') || type.startsWith('int')) return 'number';
    if (type === 'bool') return 'checkbox';
    return 'text'; // Default for address, string, bytes, etc.
};