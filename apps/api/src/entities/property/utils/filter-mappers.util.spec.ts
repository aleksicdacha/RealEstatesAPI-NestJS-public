import {
  FloorFilterMapper,
  NEIGHBORHOOD_MAP,
  ROOM_STRUCTURE_MAP,
  BEOGRAD_NEIGHBORHOODS,
  FLOOR_SPECIAL_VALUES,
  NeighborhoodMapper,
  RoomStructureMapper,
} from './filter-mappers.util';

describe('FloorFilterMapper', () => {
  describe('mapFloorToCondition', () => {
    it('maps SU to basement (-1)', () => {
      expect(FloorFilterMapper.mapFloorToCondition('SU')).toBe(
        `property.floor = ${FLOOR_SPECIAL_VALUES.BASEMENT}`,
      );
    });

    it('maps suteren to basement', () => {
      expect(FloorFilterMapper.mapFloorToCondition('suteren')).toBe(
        `property.floor = ${FLOOR_SPECIAL_VALUES.BASEMENT}`,
      );
    });

    it('maps VPR to ground floor (0)', () => {
      expect(FloorFilterMapper.mapFloorToCondition('VPR')).toBe(
        `property.floor = ${FLOOR_SPECIAL_VALUES.GROUND_FLOOR}`,
      );
    });

    it('maps visoko prizemlje to ground floor', () => {
      expect(FloorFilterMapper.mapFloorToCondition('visoko prizemlje')).toBe(
        `property.floor = ${FLOOR_SPECIAL_VALUES.GROUND_FLOOR}`,
      );
    });

    it('maps PR to ground floor (0)', () => {
      expect(FloorFilterMapper.mapFloorToCondition('PR')).toBe(
        `property.floor = ${FLOOR_SPECIAL_VALUES.GROUND_FLOOR}`,
      );
    });

    it('maps prizemlje to ground floor', () => {
      expect(FloorFilterMapper.mapFloorToCondition('prizemlje')).toBe(
        `property.floor = ${FLOOR_SPECIAL_VALUES.GROUND_FLOOR}`,
      );
    });

    it('maps PTK to attic (>= 10)', () => {
      expect(FloorFilterMapper.mapFloorToCondition('PTK')).toBe(
        `property.floor >= ${FLOOR_SPECIAL_VALUES.ATTIC_MIN}`,
      );
    });

    it('maps potkrovlje to attic', () => {
      expect(FloorFilterMapper.mapFloorToCondition('potkrovlje')).toBe(
        `property.floor >= ${FLOOR_SPECIAL_VALUES.ATTIC_MIN}`,
      );
    });

    it('maps range 2-4', () => {
      expect(FloorFilterMapper.mapFloorToCondition('2-4')).toBe(
        '(property.floor >= 2 AND property.floor <= 4)',
      );
    });

    it('maps range 5-10', () => {
      expect(FloorFilterMapper.mapFloorToCondition('5-10')).toBe(
        '(property.floor >= 5 AND property.floor <= 10)',
      );
    });

    it('maps 11+', () => {
      expect(FloorFilterMapper.mapFloorToCondition('11+')).toBe(
        'property.floor >= 11',
      );
    });

    it('maps numeric value', () => {
      expect(FloorFilterMapper.mapFloorToCondition('5')).toBe(
        'property.floor = 5',
      );
    });

    it('maps negative numeric value', () => {
      expect(FloorFilterMapper.mapFloorToCondition('-1')).toBe(
        'property.floor = -1',
      );
    });

    it('returns null for invalid input', () => {
      expect(FloorFilterMapper.mapFloorToCondition('invalid')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(FloorFilterMapper.mapFloorToCondition('')).toBeNull();
    });
  });

  describe('mapFloors', () => {
    it('maps multiple floor values', () => {
      const result = FloorFilterMapper.mapFloors(['SU', '3', 'PTK']);
      expect(result).toHaveLength(3);
      expect(result[0]).toContain('-1');
      expect(result[1]).toContain('3');
      expect(result[2]).toContain('10');
    });

    it('filters out invalid values', () => {
      const result = FloorFilterMapper.mapFloors(['SU', 'invalid', '3']);
      expect(result).toHaveLength(2);
    });

    it('handles empty array', () => {
      expect(FloorFilterMapper.mapFloors([])).toEqual([]);
    });
  });
});

describe('NEIGHBORHOOD_MAP', () => {
  it('maps all expected slugs', () => {
    expect(NEIGHBORHOOD_MAP['medijana']).toBe('Medijana');
    expect(NEIGHBORHOOD_MAP['crveni-krst']).toBe('Crveni Krst');
    expect(NEIGHBORHOOD_MAP['niska-banja']).toBe('Niška Banja');
    expect(NEIGHBORHOOD_MAP['cair']).toBe('Čair');
    expect(NEIGHBORHOOD_MAP['cele-kula']).toBe('Čele kula');
  });

  it('has no undefined values', () => {
    Object.values(NEIGHBORHOOD_MAP).forEach((val) => {
      expect(val).toBeDefined();
      expect(val.length).toBeGreaterThan(0);
    });
  });
});

describe('ROOM_STRUCTURE_MAP', () => {
  it('maps garsonjera', () => {
    expect(ROOM_STRUCTURE_MAP['garsonjera']).toContain('garsonjera');
    expect(ROOM_STRUCTURE_MAP['garsonjera']).toContain('0.5');
  });

  it('maps standard room counts', () => {
    expect(ROOM_STRUCTURE_MAP['1']).toContain('jednosoban');
    expect(ROOM_STRUCTURE_MAP['2']).toContain('dvosoban');
    expect(ROOM_STRUCTURE_MAP['3']).toContain('trosoban');
  });

  it('maps half-room structures', () => {
    expect(ROOM_STRUCTURE_MAP['1.5']).toContain('jednoiposoban');
    expect(ROOM_STRUCTURE_MAP['2.5']).toContain('dvoiposoban');
  });
});

describe('BEOGRAD_NEIGHBORHOODS', () => {
  it('contains expected neighborhoods', () => {
    expect(BEOGRAD_NEIGHBORHOODS).toContain('Beograd mala');
    expect(BEOGRAD_NEIGHBORHOODS).toContain('Beverli Hils');
  });
});

describe('FLOOR_SPECIAL_VALUES', () => {
  it('has correct constant values', () => {
    expect(FLOOR_SPECIAL_VALUES.BASEMENT).toBe(-1);
    expect(FLOOR_SPECIAL_VALUES.GROUND_FLOOR).toBe(0);
    expect(FLOOR_SPECIAL_VALUES.ATTIC_MIN).toBe(10);
  });
});

describe('NeighborhoodMapper', () => {
  it('maps known neighborhood key', () => {
    expect(NeighborhoodMapper.map('centar')).toBeDefined();
  });

  it('returns original value for unknown key', () => {
    expect(NeighborhoodMapper.map('UnknownPlace')).toBe('UnknownPlace');
  });

  it('mapBatch maps array of neighborhoods', () => {
    const result = NeighborhoodMapper.mapBatch(['centar', 'UnknownPlace']);
    expect(result).toHaveLength(2);
    expect(result[1]).toBe('UnknownPlace');
  });
});

describe('RoomStructureMapper', () => {
  it('maps known room structure', () => {
    const keys = Object.keys(ROOM_STRUCTURE_MAP);
    if (keys.length > 0) {
      const result = RoomStructureMapper.map(keys[0]);
      expect(Array.isArray(result)).toBe(true);
    }
  });

  it('returns original value wrapped in array for unknown key', () => {
    expect(RoomStructureMapper.map('unknown')).toEqual(['unknown']);
  });

  it('mapBatch maps and deduplicates', () => {
    const result = RoomStructureMapper.mapBatch(['unknown1', 'unknown2']);
    expect(result).toEqual(['unknown1', 'unknown2']);
  });
});
