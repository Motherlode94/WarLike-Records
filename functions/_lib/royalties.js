// Integer cents, percentage in basis points. Draft-only estimates, not legal accounting.
export function calculateRoyalties(grossCents,deductionsCents,basisPoints){
 if(!Number.isSafeInteger(grossCents)||grossCents<0||grossCents>100000000000||
 !Number.isSafeInteger(deductionsCents)||deductionsCents<0||deductionsCents>grossCents||
 !Number.isSafeInteger(basisPoints)||basisPoints<0||basisPoints>10000)
 throw new RangeError('Données de royalties invalides');
 return Math.round((grossCents-deductionsCents)*basisPoints/10000);
}
