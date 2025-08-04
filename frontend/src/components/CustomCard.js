import { Box, Stack, Avatar, Text, Grid, useColorModeValue } from '@chakra-ui/react';
import theme from '../theme';

const CustomCard = ({ title, value, sanand, color, bcolor, IconComponent, height }) => {

  const valueColor = useColorModeValue(theme.colors.custom.lightModeText, theme.colors.custom.darkModeText);

  return (
    <Box borderWidth="0px" borderRadius="8px" overflow="hidden" style={{ boxShadow: ' 0px 5px 22px 0px rgba(0, 0, 0, 0.04), 0px 0px 0px 1px rgba(0, 0, 0, 0.06) ' }}>
      <Grid
        width='100%'
        templateColumns={{
          base: "repeat(1, 1fr)",
        }}
        gap={6}
        padding='1% 1%'
        backgroundColor={useColorModeValue(theme.colors.custom.dashboardCardLight, theme.colors.custom.dashboardCardDark)}
        height={height}
      >
        <Stack direction="row" justifyContent="space-between" pl={3} pr={2} pt={1} pb={1}>
          <Stack spacing={0} p='5px 0 5px 0'>
            <Text color={useColorModeValue(theme.colors.custom.lightModeText, theme.colors.custom.darkModeText)} fontWeight='400' lineHeight={2.5} letterSpacing={'0.5px'}>
              {title}
            </Text>
            <Text fontSize="1.5rem" fontWeight='700' color={title === "Total Cameras" ? valueColor : color} >
              {value}
            </Text>
            {/* <Text >
              {sanand}
            </Text> */}
          </Stack>
          {/* <Avatar
          bg={color}
          borderColor={bcolor}
          borderWidth="0px"
          boxShadow="md"
          height="12"
          width="12"
        >
          {IconComponent && <IconComponent />}
        </Avatar> */}
          {/* <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg={color}
            borderColor={bcolor}
            borderWidth="0px"
            height="56px"
            width="56px"
            borderRadius="50%"
          >
            {IconComponent && <IconComponent color={bcolor} size="24px" />}
        </Box> */}
        </Stack>
      </Grid>
    </Box >
  );
};

export default CustomCard;
