import { launchpadPurchaseOrderCustomType } from '../custom-types/custom-types';
import { log } from '../libs/logger';
import { paymentSDK } from '../payment-sdk';

export async function createLaunchpadPurchaseOrderNumberCustomType(): Promise<void> {
  const apiClient = paymentSDK.ctAPI.client;

  const getRes = await apiClient
    .types()
    .get({
      queryArgs: {
        where: `key="${launchpadPurchaseOrderCustomType.key}"`,
      },
    })
    .execute();

  const requiredFields = [
    {
      type: { name: 'String' as const },
      name: launchpadPurchaseOrderCustomType.purchaseOrderNumber,
      label: { en: 'Purchase Order Number' },
      required: true,
    },
    {
      type: { name: 'String' as const },
      name: launchpadPurchaseOrderCustomType.invoiceMemo,
      label: { en: 'Invoice Memo' },
      required: false,
    },
  ];

  if (getRes.body.results.length) {
    const existingType = getRes.body.results[0];
    const existingFieldNames = existingType.fieldDefinitions.map((f) => f.name);
    const missingFields = requiredFields.filter((field) => !existingFieldNames.includes(field.name));

    if (!missingFields.length) {
      log.info('Launchpad purchase order number custom type already exists with all required fields. Skipping.');
      return;
    }

    await apiClient
      .types()
      .withKey({ key: launchpadPurchaseOrderCustomType.key })
      .post({
        body: {
          version: existingType.version,
          actions: missingFields.map((field) => ({
            action: 'addFieldDefinition' as const,
            fieldDefinition: field,
          })),
        },
      })
      .execute();

    log.info('Launchpad purchase order number custom type updated with missing fields.');
    return;
  }

  const postRes = await apiClient
    .types()
    .post({
      body: {
        key: launchpadPurchaseOrderCustomType.key,
        name: { en: 'Additional fields to store purchase order information' },
        resourceTypeIds: ['payment'],
        fieldDefinitions: requiredFields,
      },
    })
    .execute();

  log.info('Launchpad purchase order number custom type created successfully', postRes.body?.id);
}
