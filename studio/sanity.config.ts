import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'studio',

  projectId: 'g4ifqs0b',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S, context) =>
        S.list()
          .title('Content')
          .items([
            // ─── Pages ─────────────────────────────────────────────
            S.listItem()
              .title('Pages')
              .child(
                S.list()
                  .title('Pages')
                  .items([

                    // ── Home ────────────────────────────────────────
                    S.listItem()
                      .title('Home')
                      .child(
                        S.list()
                          .title('Home')
                          .items([
                            S.listItem()
                              .title('Hero Slides')
                              .child(
                                S.list()
                                  .title('Hero Slides')
                                  .items([
                                    S.documentTypeListItem('heroSlide').title('All Slides'),
                                    orderableDocumentListDeskItem({
                                      type: 'heroSlide',
                                      title: 'Manage Order',
                                      S,
                                      context,
                                    }),
                                  ]),
                              ),
                            S.listItem()
                              .title('Images')
                              .child(
                                S.document()
                                  .schemaType('homePageImages')
                                  .documentId('homePageImages'),
                              ),
                          ]),
                      ),

                    // ── About Us ─────────────────────────────────────
                    S.listItem()
                      .title('About Us')
                      .child(
                        S.list()
                          .title('About Us')
                          .items([

                            // Our Story
                            S.listItem()
                              .title('Our Story')
                              .child(
                                S.list()
                                  .title('Our Story')
                                  .items([
                                    S.listItem()
                                      .title('Images')
                                      .child(
                                        S.document()
                                          .schemaType('ourStoryImages')
                                          .documentId('ourStoryImages'),
                                      ),
                                  ]),
                              ),

                            // Team Members
                            S.listItem()
                              .title('Team Members')
                              .child(
                                S.list()
                                  .title('Team Members')
                                  .items([
                                    S.documentTypeListItem('teamMember').title('All Members'),
                                    orderableDocumentListDeskItem({
                                      type: 'teamMember',
                                      title: 'Manage Order',
                                      S,
                                      context,
                                    }),
                                  ]),
                              ),

                            // Partners & Affiliates
                            S.listItem()
                              .title('Partners & Affiliates')
                              .child(
                                S.list()
                                  .title('Partners & Affiliates')
                                  .items([
                                    S.documentTypeListItem('partner').title('All Partners'),
                                    orderableDocumentListDeskItem({
                                      type: 'partner',
                                      title: 'Manage Order',
                                      S,
                                      context,
                                    }),
                                  ]),
                              ),

                          ]),
                      ),

                    // ── Services ─────────────────────────────────────
                    S.listItem()
                      .title('Services')
                      .child(
                        S.list()
                          .title('Services')
                          .items([
                            S.listItem()
                              .title('All Services')
                              .child(
                                S.list()
                                  .title('All Services')
                                  .items([
                                    S.listItem()
                                      .title('Images')
                                      .child(
                                        S.document()
                                          .schemaType('servicesPageImages')
                                          .documentId('servicesPageImages'),
                                      ),
                                  ]),
                              ),
                            S.listItem()
                              .title('Concierge')
                              .child(
                                S.list()
                                  .title('Concierge')
                                  .items([
                                    S.listItem()
                                      .title('Images')
                                      .child(
                                        S.document()
                                          .schemaType('conciergeImages')
                                          .documentId('conciergeImages'),
                                      ),
                                  ]),
                              ),
                            S.listItem()
                              .title('Virtual Consultations')
                              .child(
                                S.list()
                                  .title('Virtual Consultations')
                                  .items([
                                    S.listItem()
                                      .title('Images')
                                      .child(
                                        S.document()
                                          .schemaType('virtualConsultationsImages')
                                          .documentId('virtualConsultationsImages'),
                                      ),
                                  ]),
                              ),
                          ]),
                      ),

                    // ── Education ────────────────────────────────────
                    S.listItem()
                      .title('Education')
                      .child(
                        S.list()
                          .title('Education')
                          .items([
                            S.listItem()
                              .title('Practitioner Certifications')
                              .child(
                                S.list()
                                  .title('Practitioner Certifications')
                                  .items([
                                    S.listItem()
                                      .title('Images')
                                      .child(
                                        S.document()
                                          .schemaType('certificationImages')
                                          .documentId('certificationImages'),
                                      ),
                                  ]),
                              ),
                            S.listItem()
                              .title('Licensee Programs')
                              .child(
                                S.list()
                                  .title('Licensee Programs')
                                  .items([
                                    S.listItem()
                                      .title('Images')
                                      .child(
                                        S.document()
                                          .schemaType('licenseeProgramImages')
                                          .documentId('licenseeProgramImages'),
                                      ),
                                  ]),
                              ),
                            S.listItem()
                              .title('Cupping')
                              .child(
                                S.list()
                                  .title('Cupping')
                                  .items([
                                    S.listItem()
                                      .title('Images')
                                      .child(
                                        S.document()
                                          .schemaType('cuppingImages')
                                          .documentId('cuppingImages'),
                                      ),
                                  ]),
                              ),
                            S.listItem()
                              .title('Articles')
                              .child(
                                S.list()
                                  .title('Articles')
                                  .items([
                                    S.documentTypeListItem('article').title('All Articles'),
                                  ]),
                              ),
                          ]),
                      ),

                    // ── Featured On ──────────────────────────────────
                    S.listItem()
                      .title('Featured On')
                      .child(
                        S.list()
                          .title('Featured On')
                          .items([
                            S.listItem()
                              .title('Press')
                              .child(
                                S.list()
                                  .title('Press')
                                  .items([
                                    S.documentTypeListItem('pressItem').title('All Presses'),
                                    orderableDocumentListDeskItem({
                                      type: 'pressItem',
                                      title: 'Manage Order',
                                      S,
                                      context,
                                    }),
                                  ]),
                              ),
                            S.listItem()
                              .title('Media')
                              .child(
                                S.list()
                                  .title('Media')
                                  .items([
                                    S.documentTypeListItem('mediaItem').title('All Media'),
                                    orderableDocumentListDeskItem({
                                      type: 'mediaItem',
                                      title: 'Manage Order',
                                      S,
                                      context,
                                    }),
                                  ]),
                              ),
                            S.listItem()
                              .title('Awards')
                              .child(
                                S.list()
                                  .title('Awards')
                                  .items([
                                    S.documentTypeListItem('awardItem').title('All Awards'),
                                    orderableDocumentListDeskItem({
                                      type: 'awardItem',
                                      title: 'Manage Order',
                                      S,
                                      context,
                                    }),
                                  ]),
                              ),
                            S.listItem()
                              .title('QC Show')
                              .child(
                                S.list()
                                  .title('QC Show')
                                  .items([
                                    S.listItem()
                                      .title('Flyer')
                                      .child(
                                        S.document()
                                          .schemaType('qcShowFlyer')
                                          .documentId('qcShowFlyer'),
                                      ),
                                    S.documentTypeListItem('qcShowEpisode').title('All Episodes'),
                                  ]),
                              ),
                          ]),
                      ),

                    // ── Add new pages below as the site grows ────────

                  ]),
              ),

            S.divider(),

            // ─── Products ──────────────────────────────────────────
            S.listItem()
              .title('Products')
              .child(
                S.list()
                  .title('Products')
                  .items([
                    S.listItem()
                      .title('Categories')
                      .child(
                        S.list()
                          .title('Categories')
                          .items([
                            S.documentTypeListItem('category').title('All Categories'),
                            orderableDocumentListDeskItem({
                              type: 'category',
                              title: 'Manage Order',
                              S,
                              context,
                            }),
                          ]),
                      ),
                    S.documentTypeListItem('product').title('All Products'),
                  ]),
              ),

            S.divider(),

            // ─── Shipping & Coupons ─────────────────────────────────
            S.listItem()
              .title('Shipping & Coupons')
              .child(
                S.list()
                  .title('Shipping & Coupons')
                  .items([
                    S.listItem()
                      .title('Coupons')
                      .child(
                        S.documentTypeList('coupon').title('All Coupons'),
                      ),
                    S.listItem()
                      .title('Shipping Methods')
                      .child(
                        S.documentTypeList('shippingMethod').title('All Shipping Methods'),
                      ),
                  ]),
              ),

            S.divider(),

            // ─── Everything else ────────────────────────────────────
            ...S.documentTypeListItems().filter(
              (item) =>
                ![
                  'heroSlide',
                  'homePageImages',
                  'ourStoryImages',
                  'teamMember',
                  'partner',
                  'servicesPageImages',
                  'conciergeImages',
                  'virtualConsultationsImages',
                  'category',
                  'product',
                  'certificationImages',
                  'licenseeProgramImages',
                  'cuppingImages',
                  'article',
                  'pressItem',
                  'mediaItem',
                  'awardItem',
                  'qcShowFlyer',
                  'qcShowEpisode',
                  'coupon',
                  'shippingMethod',
                ].includes(item.getId() ?? ''),
            ),
          ]),
    }),
    visionTool(),
  ],

  document: {
    actions: (prev, context) => {
      const singletonTypes = [
        'homePageImages',
        'ourStoryImages',
        'servicesPageImages',
        'conciergeImages',
        'virtualConsultationsImages',
        'certificationImages',
        'licenseeProgramImages',
        'cuppingImages',
        'qcShowFlyer',
      ]
      if (singletonTypes.includes(context.schemaType)) {
        return prev.filter(({action}) =>
          !['delete', 'duplicate', 'unpublish'].includes(action ?? ''),
        )
      }
      return prev
    },
  },

  schema: {
    types: schemaTypes,
  },
})
