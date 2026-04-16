import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * The PropertyType enum was created with PascalCase values (Apartment, House, etc.)
 * but the TypeScript enum now uses lowercase-with-dashes (apartment, house, commercial-space, etc.).
 * This migration updates the DB enum values to match the TypeScript code.
 *
 * Also fixes HeatingType: DB has human-readable strings ('Central', 'Gas central', etc.)
 * while TS enum uses lowercase identifiers ('central', 'gas-central', etc.).
 *
 * NOTE: These use ALTER TYPE ... RENAME VALUE (PostgreSQL 10+).
 */
export class FixPropertyTypeEnumCasing1773850000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── PropertyType ─────────────────────────────────────────────────────────
    await queryRunner.query(`ALTER TYPE "properties_propertytype_enum" RENAME VALUE 'Apartment'       TO 'apartment'`);
    await queryRunner.query(`ALTER TYPE "properties_propertytype_enum" RENAME VALUE 'House'           TO 'house'`);
    await queryRunner.query(`ALTER TYPE "properties_propertytype_enum" RENAME VALUE 'ApartmentInHouse' TO 'apartment-in-house'`);
    await queryRunner.query(`ALTER TYPE "properties_propertytype_enum" RENAME VALUE 'Office'          TO 'office'`);
    await queryRunner.query(`ALTER TYPE "properties_propertytype_enum" RENAME VALUE 'CommercialSpace'  TO 'commercial-space'`);
    await queryRunner.query(`ALTER TYPE "properties_propertytype_enum" RENAME VALUE 'Land'            TO 'land'`);
    await queryRunner.query(`ALTER TYPE "properties_propertytype_enum" RENAME VALUE 'VacationHome'    TO 'vacation-home'`);
    await queryRunner.query(`ALTER TYPE "properties_propertytype_enum" RENAME VALUE 'Duplex'          TO 'duplex'`);

    // ── HeatingType ───────────────────────────────────────────────────────────
    await queryRunner.query(`ALTER TYPE "properties_heating_enum" RENAME VALUE 'Central'                      TO 'central'`);
    await queryRunner.query(`ALTER TYPE "properties_heating_enum" RENAME VALUE 'Gas central'                  TO 'gas-central'`);
    await queryRunner.query(`ALTER TYPE "properties_heating_enum" RENAME VALUE 'Central heating with solid fuel' TO 'solid-fuel-central'`);
    await queryRunner.query(`ALTER TYPE "properties_heating_enum" RENAME VALUE 'Electric central'              TO 'electric-central'`);
    await queryRunner.query(`ALTER TYPE "properties_heating_enum" RENAME VALUE 'Floor'                         TO 'floor'`);
    await queryRunner.query(`ALTER TYPE "properties_heating_enum" RENAME VALUE 'Independently on gas'          TO 'independent-on-gas'`);
    await queryRunner.query(`ALTER TYPE "properties_heating_enum" RENAME VALUE 'Independent on solid fuel'     TO 'independent-on-solid-fuel'`);
    await queryRunner.query(`ALTER TYPE "properties_heating_enum" RENAME VALUE 'Independently on electricity'  TO 'independent-on-electricity'`);;
    await queryRunner.query(`ALTER TYPE "properties_heating_enum" RENAME VALUE 'Fireplace'                     TO 'fireplace'`);
    await queryRunner.query(`ALTER TYPE "properties_heating_enum" RENAME VALUE 'Air conditioner'               TO 'air-conditioner'`);
    await queryRunner.query(`ALTER TYPE "properties_heating_enum" RENAME VALUE 'The rest types'                TO 'other'`);

    // ── Orientation ───────────────────────────────────────────────────────────
    // Already lowercase — no change needed.

    // Note: ALTER TYPE ... RENAME VALUE automatically updates all existing rows.
    // No manual UPDATE needed.
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE "properties_propertytype_enum" RENAME VALUE 'apartment'        TO 'Apartment'`);
    await queryRunner.query(`ALTER TYPE "properties_propertytype_enum" RENAME VALUE 'house'            TO 'House'`);
    await queryRunner.query(`ALTER TYPE "properties_propertytype_enum" RENAME VALUE 'apartment-in-house' TO 'ApartmentInHouse'`);
    await queryRunner.query(`ALTER TYPE "properties_propertytype_enum" RENAME VALUE 'office'           TO 'Office'`);
    await queryRunner.query(`ALTER TYPE "properties_propertytype_enum" RENAME VALUE 'commercial-space'  TO 'CommercialSpace'`);
    await queryRunner.query(`ALTER TYPE "properties_propertytype_enum" RENAME VALUE 'land'             TO 'Land'`);
    await queryRunner.query(`ALTER TYPE "properties_propertytype_enum" RENAME VALUE 'vacation-home'    TO 'VacationHome'`);
    await queryRunner.query(`ALTER TYPE "properties_propertytype_enum" RENAME VALUE 'duplex'           TO 'Duplex'`);

    await queryRunner.query(`ALTER TYPE "properties_heating_enum" RENAME VALUE 'central'                 TO 'Central'`);
    await queryRunner.query(`ALTER TYPE "properties_heating_enum" RENAME VALUE 'gas-central'             TO 'Gas central'`);
    await queryRunner.query(`ALTER TYPE "properties_heating_enum" RENAME VALUE 'solid-fuel-central'       TO 'Central heating with solid fuel'`);
    await queryRunner.query(`ALTER TYPE "properties_heating_enum" RENAME VALUE 'electric-central'         TO 'Electric central'`);
    await queryRunner.query(`ALTER TYPE "properties_heating_enum" RENAME VALUE 'floor'                    TO 'Floor'`);
    await queryRunner.query(`ALTER TYPE "properties_heating_enum" RENAME VALUE 'independent-on-gas'       TO 'Independently on gas'`);
    await queryRunner.query(`ALTER TYPE "properties_heating_enum" RENAME VALUE 'independent-on-solid-fuel' TO 'Independent on solid fuel'`);
    await queryRunner.query(`ALTER TYPE "properties_heating_enum" RENAME VALUE 'independent-on-electricity'     TO 'Independently on electricity'`);
    await queryRunner.query(`ALTER TYPE "properties_heating_enum" RENAME VALUE 'fireplace'                TO 'Fireplace'`);
    await queryRunner.query(`ALTER TYPE "properties_heating_enum" RENAME VALUE 'air-conditioner'          TO 'Air conditioner'`);
    await queryRunner.query(`ALTER TYPE "properties_heating_enum" RENAME VALUE 'other'                    TO 'The rest types'`);
  }
}
