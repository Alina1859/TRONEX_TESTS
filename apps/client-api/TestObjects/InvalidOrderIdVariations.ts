/**
 * Массивы вариаций некорректных значений orderId для тестирования валидации и безопасности API
 * Используется для проверки, что API корректно отклоняет все некорректные значения
 */

// Граничные значения и базовые некорректные значения для проверки валидации
export const boundaryAndInvalidOrderIdVariations = [
  // Граничные значения для orderId (должен быть > 0 и < 2147483647)
  { value: 0, description: 'Ноль (граничное значение, должно быть > 0)' },
  { value: -1, description: 'Отрицательное число -1 (граничное значение, должно быть > 0)' },
  { value: -2147483648, description: 'Минимальное 32-битное signed integer (-2147483648)' },
  { value: -1000000, description: 'Большое отрицательное число (-1000000)' },
  { value: 2147483647, description: 'Максимальное 32-битное signed integer (2147483647, должно быть < 2147483647)' },
  { value: 2147483648, description: 'Число больше максимального 32-битного integer (2147483648)' },
  { value: 2147483649, description: 'Число больше максимального 32-битного integer (2147483649)' },
  { value: 4294967295, description: 'Максимальное 32-битное unsigned integer (4294967295)' },
  
  // Базовые некорректные значения
  { value: -100, description: 'Отрицательное число (-100)' },
  { value: 0.5, description: 'Дробное число (0.5)' },
  { value: 1.5, description: 'Дробное число (1.5)' },
  { value: -0.1, description: 'Отрицательное дробное число (-0.1)' },
  { value: Number.MAX_SAFE_INTEGER + 1, description: 'Число больше MAX_SAFE_INTEGER' },
  { value: '0', description: 'Строка "0"' },
  { value: '-1', description: 'Строка "-1"' },
  { value: '-2147483648', description: 'Строка "-2147483648" (минимальное 32-битное)' },
  { value: '2147483647', description: 'Строка "2147483647" (максимальное 32-битное)' },
  { value: '2147483648', description: 'Строка "2147483648" (больше максимального)' },
  { value: 'abc', description: 'Строка "abc"' },
  { value: '1.5', description: 'Строка "1.5"' },
  { value: null, description: 'null' },
  { value: undefined, description: 'undefined' },
];

// SQL-инъекции, XSS и другие техники атак для проверки безопасности
export const securityAttackOrderIdVariations = [
  // SQL-инъекции
  { value: "1' OR '1'='1", description: 'SQL-инъекция: OR условие' },
  { value: "1' OR '1'='1' --", description: 'SQL-инъекция: OR с комментарием' },
  { value: "1' UNION SELECT NULL--", description: 'SQL-инъекция: UNION SELECT' },
  { value: "1'; DROP TABLE Order; --", description: 'SQL-инъекция: DROP TABLE' },
  { value: "1' OR 1=1--", description: 'SQL-инъекция: OR 1=1' },
  { value: "1' OR 'a'='a", description: 'SQL-инъекция: OR строковое условие' },
  { value: "1' AND 1=1--", description: 'SQL-инъекция: AND условие' },
  { value: "1' AND 1=2--", description: 'SQL-инъекция: AND ложное условие' },
  { value: "1' OR SLEEP(5)--", description: 'SQL-инъекция: SLEEP (time-based)' },
  { value: "1' OR 1=1#", description: 'SQL-инъекция: OR с # комментарием' },
  { value: "1' OR '1'='1'/*", description: 'SQL-инъекция: OR с /* комментарием' },
  { value: "1' OR 1=1 LIMIT 1--", description: 'SQL-инъекция: OR с LIMIT' },
  { value: "1' OR 1=1 ORDER BY 1--", description: 'SQL-инъекция: OR с ORDER BY' },
  { value: "1' OR 1=1 GROUP BY 1--", description: 'SQL-инъекция: OR с GROUP BY' },
  
  // XSS-атаки
  { value: '<script>alert(1)</script>', description: 'XSS: базовый script тег' },
  { value: '<img src=x onerror=alert(1)>', description: 'XSS: img onerror' },
  { value: '<svg onload=alert(1)>', description: 'XSS: svg onload' },
  { value: 'javascript:alert(1)', description: 'XSS: javascript протокол' },
  { value: '<iframe src=javascript:alert(1)>', description: 'XSS: iframe с javascript' },
  { value: '<body onload=alert(1)>', description: 'XSS: body onload' },
  { value: '<input onfocus=alert(1) autofocus>', description: 'XSS: input onfocus' },
  
  // Path traversal и специальные символы
  { value: '../../../etc/passwd', description: 'Path traversal: ../etc/passwd' },
  { value: '..\\..\\..\\windows\\system32', description: 'Path traversal: Windows' },
  { value: '../../../../etc/passwd', description: 'Path traversal: множественные ../' },
  { value: '%2e%2e%2f', description: 'Path traversal: URL-encoded ../' },
  { value: '....//....//etc/passwd', description: 'Path traversal: двойные точки' },
  
  // Специальные символы и кодировки
  { value: '1%00', description: 'Null byte injection' },
  { value: '1%27', description: 'URL-encoded одинарная кавычка' },
  { value: '1%22', description: 'URL-encoded двойная кавычка' },
  { value: '1%3B', description: 'URL-encoded точка с запятой' },
  { value: '1%2D%2D', description: 'URL-encoded -- (комментарий)' },
  { value: '1%23', description: 'URL-encoded # (комментарий)' },
  { value: '1%2F%2A', description: 'URL-encoded /* (комментарий)' },
  
  // Unicode и специальные символы
  { value: '1\u0027', description: 'Unicode одинарная кавычка' },
  { value: '1\u0022', description: 'Unicode двойная кавычка' },
  { value: '1\u0000', description: 'Unicode null byte' },
  { value: '1\u002D\u002D', description: 'Unicode -- (комментарий)' },
  
  // Комбинации и сложные атаки
  { value: "1' OR '1'='1' UNION SELECT * FROM users--", description: 'SQL-инъекция: UNION SELECT из users' },
  { value: "1' OR 1=1 LIMIT 1 OFFSET 0--", description: 'SQL-инъекция: OR с LIMIT и OFFSET' },
  { value: "1' OR EXISTS(SELECT * FROM users)--", description: 'SQL-инъекция: OR с EXISTS' },
  { value: "1' OR (SELECT COUNT(*) FROM users)>0--", description: 'SQL-инъекция: OR с подзапросом' },
  { value: "1' OR CHAR(65)=CHAR(65)--", description: 'SQL-инъекция: OR с CHAR функцией' },
  
  // NoSQL-инъекции (если используется NoSQL)
  { value: '{"$ne": null}', description: 'NoSQL-инъекция: $ne оператор' },
  { value: '{"$gt": 0}', description: 'NoSQL-инъекция: $gt оператор' },
  { value: '{"$regex": ".*"}', description: 'NoSQL-инъекция: $regex оператор' },
  
  // Длинные строки и переполнение
  { value: '1' + 'A'.repeat(1000), description: 'Очень длинная строка (1000 символов)' },
  { value: '1' + 'A'.repeat(10000), description: 'Очень длинная строка (10000 символов)' },
];

// Объединенный массив всех вариаций (для обратной совместимости)
export const invalidOrderIdVariations = [
  ...boundaryAndInvalidOrderIdVariations,
  ...securityAttackOrderIdVariations,
];

