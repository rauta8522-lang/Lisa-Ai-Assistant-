/**
 * Pure TypeScript light MD5 Hashing implementation for Gravatar compatibility.
 */
function calculateMd5(str: string): string {
  const k = [
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1, 0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
  ];
  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;

  const normalized = str.trim().toLowerCase();
  const words: number[] = [];
  const byteLen = normalized.length;
  for (let i = 0; i < byteLen; i++) {
    words[i >> 2] |= (normalized.charCodeAt(i) & 0xff) << ((i % 4) * 8);
  }
  words[byteLen >> 2] |= 0x80 << ((byteLen % 4) * 8);
  const wordLen = ((byteLen + 8) >> 6) * 16 + 14;
  while (words.length < wordLen) words.push(0);
  words.push(byteLen * 8);
  words.push(0);

  const rotateLeft = (l: number, r: number) => (l << r) | (l >>> (32 - r));

  for (let j = 0; j < words.length; j += 16) {
    let a = h0, b = h1, c = h2, d = h3;

    for (let i = 0; i < 64; i++) {
      let f = 0, g = 0;
      if (i < 16) {
        f = (b & c) | (~b & d);
        g = i;
      } else if (i < 32) {
        f = (d & b) | (~d & c);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        f = b ^ c ^ d;
        g = (3 * i + 5) % 16;
      } else {
        f = c ^ (b | ~d);
        g = (7 * i) % 16;
      }
      
      const temp = d;
      d = c;
      c = b;
      b = (b + rotateLeft((a + f + k[i] + (words[j + g] || 0)) | 0, [
        7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
        5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
        4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
        6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
      ][i])) | 0;
      a = temp;
    }

    h0 = (h0 + a) | 0;
    h1 = (h1 + b) | 0;
    h2 = (h2 + c) | 0;
    h3 = (h3 + d) | 0;
  }

  const toHex = (n: number) => {
    let out = "";
    for (let i = 0; i < 4; i++) {
      out += ((n >> (i * 8)) & 0xff).toString(16).padStart(2, "0");
    }
    return out;
  };

  return toHex(h0) + toHex(h1) + toHex(h2) + toHex(h3);
}

/**
 * Returns either the custom base64 encoded picture uploaded by user,
 * or the default gravatar URL, or a fallback colorful initials avatar.
 */
export function getUserAvatarUrl(email: string, name: string): string {
  if (!email) return "";
  
  // 1. Check if user has uploaded a custom image in local sandbox storage
  const customPic = localStorage.getItem(`lisa_avatar_${email.toLowerCase().trim()}`);
  if (customPic && customPic.startsWith("data:image/")) {
    return customPic;
  }
  
  // 2. Gravatar service URL utilizing MD5 hash
  const hash = calculateMd5(email);
  
  // Gravatar default is customized with "retro" or "identicon" if user hasn't set one
  return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=150`;
}

/**
 * Save custom base64 avatar URL for specific email index
 */
export function saveUserAvatar(email: string, base64Data: string): void {
  if (!email) return;
  localStorage.setItem(`lisa_avatar_${email.toLowerCase().trim()}`, base64Data);
}

/**
 * Delete custom avatar to rollback back to Gravatar
 */
export function removeUserAvatar(email: string): void {
  if (!email) return;
  localStorage.removeItem(`lisa_avatar_${email.toLowerCase().trim()}`);
}
